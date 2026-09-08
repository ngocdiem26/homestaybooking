package com.homestaybooking.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.request.AiItineraryGenerateRequest;
import com.homestaybooking.dto.request.CustomPlaceRequest;
import com.homestaybooking.dto.request.ItineraryUpdateDayRequest;
import com.homestaybooking.dto.request.ItineraryUpdateItemRequest;
import com.homestaybooking.dto.request.ItineraryUpdateRequest;
import com.homestaybooking.dto.response.ActivitySuggestionResponse;
import com.homestaybooking.dto.response.ItineraryDayResponse;
import com.homestaybooking.dto.response.ItineraryItemResponse;
import com.homestaybooking.dto.response.ItineraryResponse;
import com.homestaybooking.dto.response.ItineraryValidationViolation;
import com.homestaybooking.dto.response.ItineraryValidationIssueResponse;
import com.homestaybooking.entity.Homestay;
import com.homestaybooking.entity.ItineraryItem;
import com.homestaybooking.entity.User;
import com.homestaybooking.exception.AppException;
import com.homestaybooking.exception.ItineraryGenerationException;
import com.homestaybooking.repository.HomestayRepository;
import com.homestaybooking.repository.ItineraryItemRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import com.homestaybooking.service.DestinationResolver;
import com.homestaybooking.service.DestinationResolver.ResolvedDestination;
import com.homestaybooking.service.GeminiItineraryService;
import com.homestaybooking.service.ItineraryActivitySuggestionService;
import com.homestaybooking.service.ItineraryService;
import com.homestaybooking.service.ItineraryPlanningConstraintService;
import com.homestaybooking.service.ItineraryPlanningConstraintService.LockedActivitySlot;
import com.homestaybooking.service.ItineraryPlanningConstraintService.PlanningConstraints;
import com.homestaybooking.service.ItineraryValidationService;
import com.homestaybooking.service.ItineraryValidationService.ValidationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryServiceImpl implements ItineraryService {

    private static final Set<String> PUBLIC_HOMESTAY_STATUSES = Set.of("APPROVED", "ACTIVE", "VISIBLE");
    private static final Set<String> SOURCE_TYPES = Set.of(
            "SYSTEM_ACTIVITY", "ACTIVITY", "HOMESTAY", "USER_CUSTOM", "MEAL", "REST", "TRANSPORT", "FREE_TIME", "AI_SUGGESTED"
    );
    private static final DateTimeFormatter CODE_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MIN_CUSTOM_PLACE_GAP_MINUTES = 15;

    private final ItineraryItemRepository itineraryItemRepository;
    private final ItineraryActivitySuggestionService activitySuggestionService;
    private final GeminiItineraryService geminiItineraryService;
    private final HomestayRepository homestayRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final DestinationResolver destinationResolver;
    private final ItineraryValidationService itineraryValidationService;
    private final ItineraryPlanningConstraintService itineraryPlanningConstraintService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public ItineraryResponse generate(
            String authorizationHeader,
            AiItineraryGenerateRequest request
    ) {
        User user = resolveUser(authorizationHeader);

        /*
         * PHASE 1 - PRE-CHECK BEFORE GEMINI
         * Kiểm tra dữ liệu người dùng và các ràng buộc cứng trước khi tốn một lượt gọi AI.
         */
        validateRequest(request);
        validateFixedCustomPlaceTimes(request);

        ResolvedDestination destination = destinationResolver.resolve(
                request.getDestinationKeyword(),
                request.getCity(),
                request.getProvince()
        );
        applyResolvedDestination(request, destination);

        List<ActivitySuggestionResponse> activityPool = mergeActivities(
                request,
                destination
        );

        if (activityPool.isEmpty() && !hasAnyCustomPlace(request)) {
            throw new ItineraryGenerationException(
                    "NO_DESTINATION_ACTIVITIES",
                    "Hiện chưa có hoạt động phù hợp ở "
                            + destination.label()
                            + ". Bạn có thể thêm địa điểm riêng."
            );
        }

        PlanningConstraints constraints = itineraryPlanningConstraintService.prepare(
                request,
                activityPool
        );

        Map<String, Object> selectedHomestay = getSelectedHomestay(
                request.getSelectedHomeId()
        );

        String itineraryCode = createItineraryCode();

        /*
         * PHASE 2 - AI GENERATION
         * Gemini nhận đầy đủ constraints đã được backend tính trước.
         */
        JsonNode aiResult = geminiItineraryService.generateItinerary(
                request,
                activityPool,
                selectedHomestay,
                itineraryCode,
                constraints
        );

        List<ItineraryItem> items = materializeGeneratedItems(
                user.getUserId(),
                itineraryCode,
                request,
                aiResult,
                activityPool,
                selectedHomestay,
                constraints
        );

        List<ItineraryValidationViolation> violations = validateGeneratedPlan(
                items,
                aiResult,
                request,
                constraints
        );

        /*
         * PHASE 3 - AI RETRY
         * Không tự di chuyển giờ Gemini đã tạo.
         * Nếu sai, đưa đúng lỗi trở lại Gemini để nó tự lập lại lịch.
         */
        final int maxRetryCount = 2;
        int retryCount = 0;

        while (!violations.isEmpty() && retryCount < maxRetryCount) {
            retryCount++;

            JsonNode retryResult = geminiItineraryService.retryItinerary(
                    request,
                    activityPool,
                    selectedHomestay,
                    itineraryCode,
                    constraints,
                    violations
            );

            aiResult = retryResult;
            items = materializeGeneratedItems(
                    user.getUserId(),
                    itineraryCode,
                    request,
                    retryResult,
                    activityPool,
                    selectedHomestay,
                    constraints
            );

            violations = validateGeneratedPlan(
                    items,
                    retryResult,
                    request,
                    constraints
            );
        }

        /*
         * PHASE 4 - HUMAN-IN-THE-LOOP
         *
         * Sau khi Gemini đã được retry, backend KHÔNG tự xóa hoặc tự dời giờ
         * các item còn sai nữa. Thay vào đó:
         *
         * - lỗi cấu trúc nghiêm trọng (FATAL) -> từ chối lưu;
         * - lỗi thời gian/nghiệp vụ có thể chỉnh tay -> vẫn lưu lịch ở trạng thái WARNING;
         * - frontend nhận danh sách warning và đánh dấu đúng item để người dùng sửa.
         *
         * Nhờ vậy một lịch chỉ sai 1-2 mốc giờ không bị vứt bỏ toàn bộ.
         */
        if (items.isEmpty()) {
            throw new ItineraryGenerationException(
                    "ITINERARY_GENERATION_FAILED",
                    "AI không tạo được mục lịch trình nào để hiển thị."
            );
        }

        List<ItineraryValidationViolation> fatalViolations =
                violations.stream()
                        .filter(this::isFatalViolation)
                        .toList();

        if (!fatalViolations.isEmpty()) {
            logGenerationFailure(items, fatalViolations);

            throw new ItineraryGenerationException(
                    "ITINERARY_FATAL_CONSTRAINT_FAILED",
                    "AI trả về dữ liệu lịch trình có lỗi cấu trúc nghiêm trọng nên chưa thể lưu.",
                    fatalViolations
            );
        }

        List<ItineraryValidationViolation> softWarnings =
                itineraryValidationService.validateSoftWarnings(items);

        List<ItineraryValidationViolation> allWarnings =
                mergeViolations(
                        violations,
                        softWarnings
                );

        /*
         * PHASE 5 - SAVE AS SUCCESS OR WARNING
         *
         * Không cần migration DB vì bảng itineraries đã có generation_status.
         * - SUCCESS: không có warning.
         * - WARNING: lịch vẫn được lưu, người dùng có thể mở và chỉnh sửa.
         */
        sortAndRenumber(items);

        String generationStatus =
                allWarnings.isEmpty()
                        ? "SUCCESS"
                        : "WARNING";

        itineraryItemRepository.saveAll(
                items,
                generationStatus
        );

        return toResponse(
                itineraryItemRepository.findActiveByCodeForUser(
                        itineraryCode,
                        user.getUserId()
                ),
                allWarnings
        );
    }

    private List<ItineraryItem> materializeGeneratedItems(
            Integer userId,
            String itineraryCode,
            AiItineraryGenerateRequest request,
            JsonNode aiResult,
            List<ActivitySuggestionResponse> activityPool,
            Map<String, Object> selectedHomestay,
            PlanningConstraints constraints
    ) {
        List<ItineraryItem> items = buildItems(
                userId,
                itineraryCode,
                request,
                aiResult,
                activityPool,
                selectedHomestay
        );

        /*
         * Các item "locked" được backend đưa về đúng dữ liệu nguồn.
         * Đây không phải hard-code lịch mẫu:
         * - selected activity: slot được tính động từ DB trước Gemini.
         * - fixed custom place: ngày/giờ do chính người dùng nhập.
         */
        enforceLockedSelectedActivities(
                items,
                userId,
                itineraryCode,
                request,
                aiResult,
                activityPool,
                constraints
        );

        enforceFixedCustomPlaces(
                items,
                userId,
                itineraryCode,
                request,
                aiResult
        );

        sortAndRenumber(items);
        return items;
    }

    private List<ItineraryValidationViolation> validateGeneratedPlan(
            List<ItineraryItem> items,
            JsonNode aiResult,
            AiItineraryGenerateRequest request,
            PlanningConstraints constraints
    ) {
        List<ItineraryValidationViolation> violations = new ArrayList<>();

        ValidationResult hardValidation = itineraryValidationService.validate(
                items,
                request.getTotalDays()
        );
        if (hardValidation.violations() != null) {
            violations.addAll(hardValidation.violations());
        }

        violations.addAll(validateAiDayStructure(
                aiResult,
                request.getTotalDays()
        ));

        violations.addAll(validateRequiredCustomPlacesPresent(
                items,
                request.getCustomPlaces()
        ));

        violations.addAll(validateFirstDayStartConstraint(
                items,
                constraints
        ));

        return deduplicateViolations(violations);
    }

    private List<ItineraryValidationViolation> validateAiDayStructure(
            JsonNode aiResult,
            Integer totalDays
    ) {
        int expectedDays = Math.max(1, totalDays == null ? 1 : totalDays);

        if (aiResult == null || !aiResult.path("days").isArray()) {
            return List.of(new ItineraryValidationViolation(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "AI không trả về mảng days hợp lệ."
            ));
        }

        JsonNode days = aiResult.path("days");
        Set<Integer> dayNumbers = new HashSet<>();

        for (JsonNode dayNode : days) {
            int dayNumber = readInt(
                    dayNode,
                    "dayNumber",
                    -1
            );
            if (dayNumber >= 1 && dayNumber <= expectedDays) {
                dayNumbers.add(dayNumber);
            }
        }

        if (days.size() == expectedDays && dayNumbers.size() == expectedDays) {
            return List.of();
        }

        return List.of(new ItineraryValidationViolation(
                null,
                null,
                null,
                null,
                null,
                null,
                "AI phải trả đúng " + expectedDays
                        + " ngày, với dayNumber liên tục từ 1 đến "
                        + expectedDays + "."
        ));
    }

    private List<ItineraryValidationViolation> validateRequiredCustomPlacesPresent(
            List<ItineraryItem> items,
            List<CustomPlaceRequest> customPlaces
    ) {
        if (customPlaces == null || customPlaces.isEmpty()) {
            return List.of();
        }

        Set<String> presentTitles = items == null
                ? Set.of()
                : items.stream()
                        .filter(item -> "USER_CUSTOM".equalsIgnoreCase(
                                String.valueOf(item.getSourceType())
                        ))
                        .map(item -> normalizeText(item.getTitle()))
                        .filter(this::notBlank)
                        .collect(Collectors.toSet());

        List<ItineraryValidationViolation> violations = new ArrayList<>();

        for (CustomPlaceRequest place : customPlaces) {
            String title = customPlaceTitle(place);
            if (!notBlank(title)) continue;

            if (!presentTitles.contains(normalizeText(title))) {
                violations.add(new ItineraryValidationViolation(
                        place == null ? null : place.getDayNumber(),
                        title,
                        null,
                        null,
                        null,
                        null,
                        "AI đã bỏ sót địa điểm riêng mà người dùng yêu cầu."
                ));
            }
        }

        return violations;
    }

    private List<ItineraryValidationViolation> validateFirstDayStartConstraint(
            List<ItineraryItem> items,
            PlanningConstraints constraints
    ) {
        if (items == null
                || items.isEmpty()
                || constraints == null
                || constraints.firstDayEarliestStart() == null) {
            return List.of();
        }

        LocalTime earliest = constraints.firstDayEarliestStart();
        if (!earliest.isAfter(ItineraryPlanningConstraintService.NORMAL_DAY_START)) {
            return List.of();
        }

        List<ItineraryValidationViolation> violations = new ArrayList<>();

        for (ItineraryItem item : items) {
            if (item == null
                    || item.getDayNumber() == null
                    || item.getDayNumber() != 1
                    || item.getStartTime() == null) {
                continue;
            }

            if (Boolean.TRUE.equals(item.getFixedTime())
                    && "USER_CUSTOM".equalsIgnoreCase(
                            String.valueOf(item.getSourceType())
                    )) {
                continue;
            }

            if (item.getStartTime().isBefore(earliest)) {
                violations.add(new ItineraryValidationViolation(
                        1,
                        item.getTitle(),
                        item.getActivityId(),
                        generatedTime(item),
                        earliest,
                        ItineraryPlanningConstraintService.NORMAL_DAY_END,
                        "Ngày bắt đầu là hôm nay nên mục AI không được xếp trước thời điểm hiện tại cộng thời gian chuẩn bị."
                ));
            }
        }

        return violations;
    }

    private void enforceLockedSelectedActivities(
            List<ItineraryItem> items,
            Integer userId,
            String itineraryCode,
            AiItineraryGenerateRequest request,
            JsonNode aiResult,
            List<ActivitySuggestionResponse> activityPool,
            PlanningConstraints constraints
    ) {
        if (constraints == null
                || constraints.lockedSelectedActivities() == null
                || constraints.lockedSelectedActivities().isEmpty()) {
            return;
        }

        Map<Integer, ActivitySuggestionResponse> activityById = activityPool == null
                ? Map.of()
                : activityPool.stream()
                        .filter(activity -> activity != null && activity.getActivityId() != null)
                        .collect(Collectors.toMap(
                                ActivitySuggestionResponse::getActivityId,
                                activity -> activity,
                                (left, right) -> left,
                                LinkedHashMap::new
                        ));

        String title = text(
                aiResult,
                "itineraryTitle",
                defaultTitle(request)
        );
        String summary = text(aiResult, "summary", "");

        int nextOrder = items.stream()
                .map(ItineraryItem::getDisplayOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        for (LockedActivitySlot slot : constraints.lockedSelectedActivities()) {
            ActivitySuggestionResponse activity = activityById.get(slot.activityId());
            if (activity == null) continue;

            String normalizedActivityTitle = normalizeText(activity.getActivityName());
            List<ItineraryItem> matches = items.stream()
                    .filter(item -> isActivityId(item, slot.activityId())
                            || normalizedActivityTitle.equals(normalizeText(item.getTitle())))
                    .collect(Collectors.toCollection(ArrayList::new));

            ItineraryItem target;
            if (matches.isEmpty()) {
                target = createLockedSelectedActivity(
                        userId,
                        itineraryCode,
                        request,
                        title,
                        summary,
                        nextOrder++,
                        activity,
                        slot
                );
                items.add(target);
            } else {
                target = matches.get(0);
                applyLockedSelectedActivity(
                        target,
                        activity,
                        slot
                );

                if (matches.size() > 1) {
                    items.removeAll(matches.subList(1, matches.size()));
                }
            }
        }
    }

    private ItineraryItem createLockedSelectedActivity(
            Integer userId,
            String itineraryCode,
            AiItineraryGenerateRequest request,
            String title,
            String summary,
            int displayOrder,
            ActivitySuggestionResponse activity,
            LockedActivitySlot slot
    ) {
        ItineraryItem item = ItineraryItem.builder()
                .itineraryCode(itineraryCode)
                .userId(userId)
                .itineraryTitle(title)
                .destinationKeyword(request.getDestinationKeyword())
                .city(request.getCity())
                .province(request.getProvince())
                .startDate(request.getStartDate())
                .totalDays(request.getTotalDays())
                .travelerCount(request.getTravelerCount())
                .travelStyle(defaultText(request.getTravelStyle(), "DISCOVERY"))
                .pace(defaultText(request.getPace(), "MEDIUM"))
                .itinerarySummary(summary)
                .displayOrder(displayOrder)
                .itineraryStatus("ACTIVE")
                .build();

        applyLockedSelectedActivity(item, activity, slot);
        return item;
    }

    private void applyLockedSelectedActivity(
            ItineraryItem item,
            ActivitySuggestionResponse activity,
            LockedActivitySlot slot
    ) {
        item.setDayNumber(slot.dayNumber());
        item.setStartTime(slot.startTime());
        item.setEndTime(slot.endTime());
        item.setDurationMinutes(slot.durationMinutes());
        item.setPreferredTimeOfDay(defaultText(
                activity.getBestTimeOfDay(),
                "ANY"
        ));
        item.setFixedTime(false);
        item.setTitle(activity.getActivityName());
        item.setLocationName(activity.getActivityName());
        item.setAddress(activity.getAddress());
        item.setItemType("ACTIVITY");
        item.setSourceType("SYSTEM_ACTIVITY");
        item.setSourceId(activity.getActivityId().longValue());
        item.setActivityId(activity.getActivityId());
        item.setHomestayId(null);
        item.setLatitude(activity.getLatitude());
        item.setLongitude(activity.getLongitude());
        item.setEstimatedCost(activity.getEstimatedCostMin());
        item.setNote(firstNonBlank(
                activity.getShortDescription(),
                activity.getDescription(),
                "Hoạt động người dùng đã chọn."
        ));
    }

    private void enforceFixedCustomPlaces(
            List<ItineraryItem> items,
            Integer userId,
            String itineraryCode,
            AiItineraryGenerateRequest request,
            JsonNode aiResult
    ) {
        if (request.getCustomPlaces() == null
                || request.getCustomPlaces().isEmpty()) {
            return;
        }

        String title = text(
                aiResult,
                "itineraryTitle",
                defaultTitle(request)
        );
        String summary = text(aiResult, "summary", "");

        int nextOrder = items.stream()
                .map(ItineraryItem::getDisplayOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        for (CustomPlaceRequest place : request.getCustomPlaces()) {
            if (place == null || !Boolean.TRUE.equals(place.getFixedTime())) {
                continue;
            }

            String placeTitle = customPlaceTitle(place);
            if (!notBlank(placeTitle)) continue;

            List<ItineraryItem> sameTitleItems = items.stream()
                    .filter(item -> normalizeText(placeTitle).equals(
                            normalizeText(item.getTitle())
                    ))
                    .collect(Collectors.toCollection(ArrayList::new));

            ItineraryItem target = sameTitleItems.stream()
                    .filter(item -> "USER_CUSTOM".equalsIgnoreCase(
                            String.valueOf(item.getSourceType())
                    ))
                    .findFirst()
                    .orElse(sameTitleItems.isEmpty() ? null : sameTitleItems.get(0));

            if (target == null) {
                target = ItineraryItem.builder()
                        .itineraryCode(itineraryCode)
                        .userId(userId)
                        .itineraryTitle(title)
                        .destinationKeyword(request.getDestinationKeyword())
                        .city(request.getCity())
                        .province(request.getProvince())
                        .startDate(request.getStartDate())
                        .totalDays(request.getTotalDays())
                        .travelerCount(request.getTravelerCount())
                        .travelStyle(defaultText(request.getTravelStyle(), "DISCOVERY"))
                        .pace(defaultText(request.getPace(), "MEDIUM"))
                        .itinerarySummary(summary)
                        .displayOrder(nextOrder++)
                        .itineraryStatus("ACTIVE")
                        .build();
                items.add(target);
            }

            LocalTime start = parseTimeString(place.getStartTime());
            LocalTime end = parseTimeString(place.getEndTime());
            Integer duration = place.getDurationMinutes();

            if (duration == null || duration <= 0) {
                duration = start != null && end != null && end.isAfter(start)
                        ? Math.toIntExact(Duration.between(start, end).toMinutes())
                        : 60;
            }

            if (end == null && start != null) {
                end = start.plusMinutes(duration);
            }

            target.setDayNumber(clampDay(
                    place.getDayNumber() == null ? 1 : place.getDayNumber(),
                    request.getTotalDays()
            ));
            target.setStartTime(start);
            target.setEndTime(end);
            target.setDurationMinutes(duration);
            target.setPreferredTimeOfDay(place.getPreferredTimeOfDay());
            target.setFixedTime(true);
            target.setTitle(placeTitle);
            target.setLocationName(placeTitle);
            target.setAddress(place.getAddress());
            target.setItemType(defaultText(place.getItemType(), "CUSTOM"));
            target.setSourceType("USER_CUSTOM");
            target.setSourceId(null);
            target.setActivityId(null);
            target.setHomestayId(null);
            target.setLatitude(place.getLatitude());
            target.setLongitude(place.getLongitude());
            target.setNote(place.getNote());

            if (sameTitleItems.size() > 1) {
                for (ItineraryItem duplicate : sameTitleItems) {
                    if (duplicate != target) {
                        items.remove(duplicate);
                    }
                }
            }
        }
    }

    /**
     * Validation dùng cho lịch đã lưu hoặc lịch người dùng vừa chỉnh.
     *
     * Khác validateGeneratedPlan(): ở đây không còn JSON gốc của Gemini,
     * nên chỉ kiểm tra dữ liệu item thực tế + đủ số ngày của chuyến đi.
     */
    private List<ItineraryValidationViolation> collectEditablePlanViolations(
            List<ItineraryItem> items,
            Integer totalDays
    ) {
        List<ItineraryValidationViolation> violations = new ArrayList<>();

        ValidationResult validation =
                itineraryValidationService.validate(
                        items,
                        Math.max(
                                1,
                                totalDays == null
                                        ? 1
                                        : totalDays
                        )
                );

        if (validation.violations() != null) {
            violations.addAll(
                    validation.violations()
            );
        }

        violations.addAll(
                validateExpectedDayCoverage(
                        items,
                        totalDays
                )
        );

        return deduplicateViolations(
                violations
        );
    }

    /**
     * Nếu AI chỉ sinh ngày 1 trong chuyến đi 2 ngày thì không vứt toàn bộ lịch.
     * Backend trả warning cho ngày còn thiếu để người dùng có thể tự thêm mục.
     */
    private List<ItineraryValidationViolation> validateExpectedDayCoverage(
            List<ItineraryItem> items,
            Integer totalDays
    ) {
        int expectedDays =
                Math.max(
                        1,
                        totalDays == null
                                ? 1
                                : totalDays
                );

        Set<Integer> presentDays =
                items == null
                        ? Set.of()
                        : items.stream()
                                .map(ItineraryItem::getDayNumber)
                                .filter(day ->
                                        day != null
                                                && day >= 1
                                                && day <= expectedDays
                                )
                                .collect(Collectors.toSet());

        List<ItineraryValidationViolation> warnings =
                new ArrayList<>();

        for (int day = 1; day <= expectedDays; day++) {
            if (presentDays.contains(day)) {
                continue;
            }

            warnings.add(
                    new ItineraryValidationViolation(
                            day,
                            null,
                            null,
                            null,
                            null,
                            null,
                            "Lịch trình chưa có hoạt động cho ngày "
                                    + day
                                    + "."
                    )
            );
        }

        return warnings;
    }

    /**
     * Chỉ các lỗi cấu trúc thật sự nguy hiểm mới là FATAL.
     *
     * Các lỗi thời gian như ngoài giờ mở cửa, overlap hoặc thiếu buffer
     * vẫn được lưu với trạng thái WARNING để người dùng tự sửa.
     */
    private boolean isFatalViolation(
            ItineraryValidationViolation violation
    ) {
        if (violation == null) {
            return false;
        }

        String reason =
                normalizeText(
                        violation.reason()
                );

        return reason.contains(
                        "lich trinh khong co muc nao"
                )
                || reason.contains(
                        "sourcetype khong hop le"
                )
                || reason.contains(
                        "ngay trong lich trinh khong hop le"
                )
                || reason.contains(
                        "hoat dong he thong khong ton tai"
                )
                || reason.contains(
                        "ai khong tra ve mang days hop le"
                );
    }

    private List<ItineraryValidationViolation> mergeViolations(
            List<ItineraryValidationViolation> first,
            List<ItineraryValidationViolation> second
    ) {
        List<ItineraryValidationViolation> merged =
                new ArrayList<>();

        if (first != null) {
            merged.addAll(first);
        }

        if (second != null) {
            merged.addAll(second);
        }

        return deduplicateViolations(
                merged
        );
    }

    private List<ItineraryValidationIssueResponse> buildValidationIssues(
            List<ItineraryValidationViolation> violations
    ) {
        if (violations == null
                || violations.isEmpty()) {
            return List.of();
        }

        return deduplicateViolations(
                violations
        ).stream()
                .map(this::toValidationIssue)
                .toList();
    }

    private ItineraryValidationIssueResponse toValidationIssue(
            ItineraryValidationViolation violation
    ) {
        String severity =
                isFatalViolation(violation)
                        ? "FATAL"
                        : "WARNING";

        return ItineraryValidationIssueResponse.builder()
                .code(validationIssueCode(violation))
                .severity(severity)
                .dayNumber(violation.dayNumber())
                .itemTitle(violation.itemTitle())
                .activityId(violation.activityId())
                .generatedTime(violation.generatedTime())
                .allowedOpeningTime(
                        violation.allowedOpeningTime()
                )
                .allowedClosingTime(
                        violation.allowedClosingTime()
                )
                .message(
                        firstNonBlank(
                                violation.reason(),
                                "Mục lịch trình cần được kiểm tra."
                        )
                )
                .suggestedFix(
                        suggestedFix(violation)
                )
                .build();
    }

    private String validationIssueCode(
            ItineraryValidationViolation violation
    ) {
        String reason =
                normalizeText(
                        violation == null
                                ? null
                                : violation.reason()
                );

        if (reason.contains("ngoai gio mo cua")) {
            return "OUTSIDE_OPENING_HOURS";
        }

        if (reason.contains("chong thoi gian")) {
            return "TIME_OVERLAP";
        }

        if (reason.contains("15 phut")
                || reason.contains("di chuyen")) {
            return "TRAVEL_BUFFER";
        }

        if (reason.contains("gio ket thuc phai sau gio bat dau")) {
            return "INVALID_TIME_RANGE";
        }

        if (reason.contains("thieu gio")) {
            return "MISSING_TIME";
        }

        if (reason.contains("06:00-22:30")) {
            return "OUTSIDE_DAILY_WINDOW";
        }

        if (reason.contains("bua sang")
                || reason.contains("bua trua")
                || reason.contains("bua toi")) {
            return "MEAL_TIME_PREFERENCE";
        }

        if (reason.contains("bo sot dia diem rieng")) {
            return "MISSING_CUSTOM_PLACE";
        }

        if (reason.contains("chua co hoat dong cho ngay")
                || reason.contains("phai tra dung")) {
            return "DAY_STRUCTURE";
        }

        if (reason.contains("ngay bat dau la hom nay")) {
            return "FIRST_DAY_START";
        }

        if (reason.contains("hoat dong he thong khong ton tai")) {
            return "ACTIVITY_NOT_FOUND";
        }

        if (reason.contains("sourcetype")) {
            return "INVALID_SOURCE_TYPE";
        }

        if (reason.contains("ngay trong lich trinh khong hop le")) {
            return "INVALID_DAY";
        }

        return "ITINERARY_WARNING";
    }

    private String suggestedFix(
            ItineraryValidationViolation violation
    ) {
        if (violation == null) {
            return "Kiểm tra và chỉnh lại mục lịch trình.";
        }

        String code =
                validationIssueCode(
                        violation
                );

        return switch (code) {
            case "OUTSIDE_OPENING_HOURS" ->
                    violation.allowedOpeningTime() != null
                            && violation.allowedClosingTime() != null
                            ? "Chuyển hoạt động vào khung "
                                    + violation.allowedOpeningTime()
                                    + " - "
                                    + violation.allowedClosingTime()
                                    + "."
                            : "Chuyển hoạt động vào giờ mở cửa của địa điểm.";

            case "TIME_OVERLAP" ->
                    "Dời giờ bắt đầu hoặc giờ kết thúc để không trùng với hoạt động trước.";

            case "TRAVEL_BUFFER" ->
                    "Tạo khoảng trống ít nhất 15 phút giữa hai địa điểm khác nhau.";

            case "INVALID_TIME_RANGE" ->
                    "Đặt giờ kết thúc sau giờ bắt đầu.";

            case "MISSING_TIME" ->
                    "Bổ sung đầy đủ giờ bắt đầu và giờ kết thúc.";

            case "OUTSIDE_DAILY_WINDOW" ->
                    "Chuyển mục AI vào khoảng 06:00 - 22:30.";

            case "MEAL_TIME_PREFERENCE" ->
                    "Điều chỉnh bữa ăn về khung giờ gợi ý nếu phù hợp.";

            case "MISSING_CUSTOM_PLACE" ->
                    "Thêm lại địa điểm riêng mà bạn đã yêu cầu.";

            case "DAY_STRUCTURE" ->
                    "Bổ sung ít nhất một mục cho ngày đang thiếu.";

            case "FIRST_DAY_START" ->
                    violation.allowedOpeningTime() != null
                            ? "Dời hoạt động ngày đầu sang sau "
                                    + violation.allowedOpeningTime()
                                    + "."
                            : "Dời hoạt động ngày đầu sang thời điểm sau hiện tại.";

            case "ACTIVITY_NOT_FOUND" ->
                    "Xóa mục này hoặc chọn lại một hoạt động đang hoạt động trong Cozygo.";

            default ->
                    "Kiểm tra mục được đánh dấu và chỉnh thời gian/nội dung cho phù hợp.";
        };
    }

    private boolean validationIssueMatchesItem(
            ItineraryValidationIssueResponse issue,
            ItineraryItem item
    ) {
        if (issue == null || item == null) {
            return false;
        }

        if (issue.getDayNumber() != null
                && item.getDayNumber() != null
                && !issue.getDayNumber().equals(
                        item.getDayNumber()
                )) {
            return false;
        }

        Integer itemActivityId =
                item.getActivityId();

        if (itemActivityId == null
                && item.getSourceId() != null
                && "SYSTEM_ACTIVITY".equalsIgnoreCase(
                        String.valueOf(
                                item.getSourceType()
                        )
                )) {
            itemActivityId =
                    item.getSourceId()
                            .intValue();
        }

        if (issue.getActivityId() != null) {
            return issue.getActivityId()
                    .equals(
                            itemActivityId
                    );
        }

        if (notBlank(
                issue.getItemTitle()
        )) {
            return normalizeText(
                    issue.getItemTitle()
            ).equals(
                    normalizeText(
                            item.getTitle()
                    )
            );
        }

        return false;
    }

    private List<ItineraryItem> removeInvalidOptionalItems(
            List<ItineraryItem> items,
            List<ItineraryValidationViolation> violations,
            List<Integer> selectedActivityIds
    ) {
        if (items == null
                || items.isEmpty()
                || violations == null
                || violations.isEmpty()) {
            return items == null
                    ? new ArrayList<>()
                    : new ArrayList<>(items);
        }

        Set<Integer> selectedIds = selectedActivityIds == null
                ? Set.of()
                : selectedActivityIds.stream()
                        .filter(id -> id != null && id > 0)
                        .collect(Collectors.toSet());

        return items.stream()
                .filter(item -> {
                    if (!isOptionalGeneratedItem(item, selectedIds)) {
                        return true;
                    }

                    return violations.stream().noneMatch(
                            violation -> violationMatchesItem(
                                    violation,
                                    item
                            )
                    );
                })
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private boolean isOptionalGeneratedItem(
            ItineraryItem item,
            Set<Integer> selectedIds
    ) {
        if (item == null || Boolean.TRUE.equals(item.getFixedTime())) {
            return false;
        }

        String sourceType = normalizeSourceType(item.getSourceType());

        if ("USER_CUSTOM".equals(sourceType)) {
            return false;
        }

        if ("SYSTEM_ACTIVITY".equals(sourceType)) {
            Integer id = item.getActivityId() != null
                    ? item.getActivityId()
                    : item.getSourceId() == null
                            ? null
                            : item.getSourceId().intValue();
            return id == null || !selectedIds.contains(id);
        }

        return Set.of(
                "AI_SUGGESTED",
                "MEAL",
                "REST",
                "TRANSPORT",
                "FREE_TIME"
        ).contains(sourceType);
    }

    private boolean violationMatchesItem(
            ItineraryValidationViolation violation,
            ItineraryItem item
    ) {
        if (violation == null || item == null) return false;

        if (violation.dayNumber() != null
                && item.getDayNumber() != null
                && !violation.dayNumber().equals(item.getDayNumber())) {
            return false;
        }

        Integer itemActivityId = item.getActivityId();
        if (itemActivityId == null
                && item.getSourceId() != null
                && "SYSTEM_ACTIVITY".equalsIgnoreCase(
                        String.valueOf(item.getSourceType())
                )) {
            itemActivityId = item.getSourceId().intValue();
        }

        if (violation.activityId() != null) {
            return violation.activityId().equals(itemActivityId);
        }

        if (notBlank(violation.itemTitle())) {
            return normalizeText(violation.itemTitle()).equals(
                    normalizeText(item.getTitle())
            );
        }

        return false;
    }

    private boolean isActivityId(
            ItineraryItem item,
            Integer activityId
    ) {
        if (item == null || activityId == null) return false;

        Integer currentId = item.getActivityId();
        if (currentId == null && item.getSourceId() != null) {
            currentId = item.getSourceId().intValue();
        }

        return activityId.equals(currentId);
    }

    private List<ItineraryValidationViolation> deduplicateViolations(
            List<ItineraryValidationViolation> violations
    ) {
        if (violations == null || violations.isEmpty()) {
            return List.of();
        }

        Map<String, ItineraryValidationViolation> unique = new LinkedHashMap<>();

        for (ItineraryValidationViolation violation : violations) {
            if (violation == null) continue;

            String key = String.valueOf(violation.dayNumber())
                    + "|" + normalizeText(violation.itemTitle())
                    + "|" + String.valueOf(violation.activityId())
                    + "|" + String.valueOf(violation.generatedTime())
                    + "|" + String.valueOf(violation.reason());

            unique.putIfAbsent(key, violation);
        }

        return new ArrayList<>(unique.values());
    }

    private String generatedTime(ItineraryItem item) {
        if (item == null) return null;

        String start = item.getStartTime() == null
                ? "?"
                : item.getStartTime().toString();
        String end = item.getEndTime() == null
                ? "?"
                : item.getEndTime().toString();

        return start + "-" + end;
    }

    private void logGenerationFailure(
            List<ItineraryItem> items,
            List<ItineraryValidationViolation> violations
    ) {
        System.err.println("===== ITINERARY GENERATION FAILED =====");
        System.err.println("Số mục còn lại: " + (items == null ? 0 : items.size()));

        if (violations != null) {
            for (ItineraryValidationViolation violation : violations) {
                System.err.println(
                        "Ngày=" + violation.dayNumber()
                                + " | title=" + violation.itemTitle()
                                + " | activityId=" + violation.activityId()
                                + " | generated=" + violation.generatedTime()
                                + " | allowed=" + violation.allowedOpeningTime()
                                + "-" + violation.allowedClosingTime()
                                + " | reason=" + violation.reason()
                );
            }
        }

        System.err.println("=======================================");
    }

    private void sortAndRenumber(List<ItineraryItem> items) {
        if (items == null || items.isEmpty()) return;

        items.sort(Comparator
                .comparing((ItineraryItem item) -> item.getDayNumber() == null
                        ? 1
                        : item.getDayNumber())
                .thenComparing(item -> item.getStartTime() == null
                        ? LocalTime.MAX
                        : item.getStartTime())
                .thenComparing(item -> item.getDisplayOrder() == null
                        ? Integer.MAX_VALUE
                        : item.getDisplayOrder()));

        int order = 1;
        for (ItineraryItem item : items) {
            item.setDisplayOrder(order++);
        }
    }

    @Override
    public List<ItineraryResponse> getMyItineraries(String authorizationHeader) {
        User user = resolveUser(authorizationHeader);
        return itineraryItemRepository.findSummariesByUserId(user.getUserId()).stream()
                .map(item -> {
                    ItineraryResponse response = summaryResponse(item);
                    response.setItemCount(itineraryItemRepository.countItems(item.getItineraryCode(), user.getUserId()));
                    return response;
                })
                .toList();
    }

    @Override
    public ItineraryResponse getDetail(String authorizationHeader, String itineraryCode) {
        User user = resolveUser(authorizationHeader);
        List<ItineraryItem> items = itineraryItemRepository.findActiveByCodeForUser(itineraryCode, user.getUserId());
        if (items.isEmpty()) {
            throw new AppException("KhĂ´ng tĂ¬m tháº¥y lá»‹ch trĂ¬nh hoáº·c báº¡n khĂ´ng cĂ³ quyá»n xem.");
        }
        return toResponse(items);
    }


    @Override
    @Transactional
    public ItineraryResponse update(String authorizationHeader, String itineraryCode, ItineraryUpdateRequest request) {
        User user = resolveUser(authorizationHeader);
        List<ItineraryItem> currentItems = itineraryItemRepository.findActiveByCodeForUser(itineraryCode, user.getUserId());
        if (currentItems.isEmpty()) {
            throw new AppException("Khong tim thay lich trinh hoac ban khong co quyen sua.");
        }
        
        ItineraryItem first = currentItems.get(0);

        Map<Long, ItineraryItem> currentItemById =
                currentItems.stream()
                        .filter(item -> item.getItemId() != null)
                        .collect(Collectors.toMap(
                                ItineraryItem::getItemId,
                                item -> item,
                                (firstItem, duplicateItem) -> firstItem,
                                LinkedHashMap::new
                        ));

        List<ItineraryItem> updatedItems =
                buildUpdatedItems(
                        first,
                        request,
                        currentItemById
                );

        if (updatedItems.isEmpty()) {
            throw new AppException("Lich trinh phai co it nhat mot muc.");
        }
        sortAndRenumber(updatedItems);

        List<ItineraryValidationViolation> hardViolations =
                collectEditablePlanViolations(
                        updatedItems,
                        first.getTotalDays()
                );

        AiItineraryGenerateRequest originalRequest =
                readOriginalGenerateRequest(
                        first
                );

        if (originalRequest != null) {
            hardViolations =
                    mergeViolations(
                            hardViolations,
                            validateRequiredCustomPlacesPresent(
                                    updatedItems,
                                    originalRequest.getCustomPlaces()
                            )
                    );
        }

        List<ItineraryValidationViolation> fatalViolations =
                hardViolations.stream()
                        .filter(this::isFatalViolation)
                        .toList();

        if (!fatalViolations.isEmpty()) {
            throw new ItineraryGenerationException(
                    "ITINERARY_FATAL_CONSTRAINT_FAILED",
                    "Lịch trình còn lỗi cấu trúc nghiêm trọng. Vui lòng sửa các mục được báo lỗi.",
                    fatalViolations
            );
        }

        List<ItineraryValidationViolation> allWarnings =
                mergeViolations(
                        hardViolations,
                        itineraryValidationService.validateSoftWarnings(updatedItems)
                );

        String generationStatus =
                allWarnings.isEmpty()
                        ? "SUCCESS"
                        : "WARNING";

        String title = defaultText(
                request.getItineraryTitle(),
                first.getItineraryTitle()
        );

        String summary = defaultText(
                request.getSummary(),
                first.getItinerarySummary()
        );

        itineraryItemRepository.replaceItems(
                itineraryCode,
                user.getUserId(),
                title,
                summary,
                updatedItems,
                generationStatus
        );

        return toResponse(
                itineraryItemRepository.findActiveByCodeForUser(
                        itineraryCode,
                        user.getUserId()
                ),
                allWarnings
        );
    }

    private List<ItineraryItem> buildUpdatedItems(
        ItineraryItem first,
        ItineraryUpdateRequest request,
        Map<Long, ItineraryItem> currentItemById
    ) {
        List<ItineraryItem> items = new ArrayList<>();
        if (request == null || request.getDays() == null) return items;
        int displayOrder = 1;
        for (ItineraryUpdateDayRequest day : request.getDays()) {
            if (day == null || day.getItems() == null) continue;
            int dayNumber = clampDay(day.getDayNumber() == null ? 1 : day.getDayNumber(), first.getTotalDays());
            for (ItineraryUpdateItemRequest item : day.getItems()) {
                if (item == null || !notBlank(item.getTitle())) continue;
                ItineraryItem originalItem =
                        item.getItemId() == null
                                ? null
                                : currentItemById.get(item.getItemId());

                String fallbackSourceType =
                        originalItem == null
                                ? "AI_SUGGESTED"
                                : originalItem.getSourceType();

                String sourceType = normalizeSourceType(
                        defaultText(
                                item.getSourceType(),
                                fallbackSourceType
                        )
                );

                /*
                * Ưu tiên ID frontend gửi lên.
                * Nếu frontend không gửi thì lấy lại từ dữ liệu cũ.
                */
                Long sourceId = item.getSourceId();

                if (sourceId == null && originalItem != null) {
                    sourceId = originalItem.getSourceId();
                }

                Integer activityId = item.getActivityId();

                if (activityId == null && originalItem != null) {
                    activityId = originalItem.getActivityId();
                }

                Integer homestayId = item.getHomestayId();

                if (homestayId == null && originalItem != null) {
                    homestayId = originalItem.getHomestayId();
                }

                /*
                * Chuẩn hóa quan hệ nguồn.
                */
                if ("SYSTEM_ACTIVITY".equals(sourceType)) {
                    if (activityId == null && sourceId != null) {
                        activityId = sourceId.intValue();
                    }

                    if (sourceId == null && activityId != null) {
                        sourceId = activityId.longValue();
                    }

                    homestayId = null;
                } else if ("HOMESTAY".equals(sourceType)) {
                    if (homestayId == null && sourceId != null) {
                        homestayId = sourceId.intValue();
                    }

                    if (sourceId == null && homestayId != null) {
                        sourceId = homestayId.longValue();
                    }

                    activityId = null;
                } else {
                    /*
                    * Mục tự nhập hoặc AI tự tạo không tham chiếu
                    * activities/homestays.
                    */
                    sourceId = null;
                    activityId = null;
                    homestayId = null;
                }
                
                items.add(ItineraryItem.builder()
                        .itineraryCode(first.getItineraryCode())
                        .userId(first.getUserId())
                        .itineraryTitle(defaultText(request.getItineraryTitle(), first.getItineraryTitle()))
                        .destinationKeyword(first.getDestinationKeyword())
                        .city(first.getCity())
                        .province(first.getProvince())
                        .startDate(first.getStartDate())
                        .totalDays(first.getTotalDays())
                        .travelerCount(first.getTravelerCount())
                        .travelStyle(first.getTravelStyle())
                        .pace(first.getPace())
                        .itinerarySummary(defaultText(request.getSummary(), first.getItinerarySummary()))
                        .dayNumber(dayNumber)
                        .displayOrder(item.getDisplayOrder() == null ? displayOrder : item.getDisplayOrder())
                        .startTime(item.getStartTime())
                        .endTime(item.getEndTime())
                        .durationMinutes(item.getDurationMinutes())
                        .preferredTimeOfDay(defaultText(item.getPreferredTimeOfDay(), "ANY"))
                        .fixedTime(Boolean.TRUE.equals(item.getFixedTime()))
                        .title(item.getTitle().trim())
                        .locationName(defaultText(item.getLocationName(), item.getTitle()))
                        .address(item.getAddress())
                        .itemType(defaultText(item.getItemType(), "ACTIVITY"))
                        .sourceType(sourceType)
                        .sourceId(sourceId)
                        .activityId(activityId)
                        .homestayId(homestayId)
                        .latitude(item.getLatitude())
                        .longitude(item.getLongitude())
                        .estimatedCost(item.getEstimatedCost())
                        .transportNote(item.getTransportNote())
                        .note(item.getNote())
                        .itineraryStatus("ACTIVE")
                        .build());
                displayOrder++;
            }
        }
        return items;
    }
    @Override
    @Transactional
    public void delete(String authorizationHeader, String itineraryCode) {
        User user = resolveUser(authorizationHeader);
        itineraryItemRepository.softDelete(itineraryCode, user.getUserId());
    }

    private User resolveUser(String authorizationHeader) {
        String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
        if (email == null || email.isBlank()) {
            throw new AppException("Vui lĂ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ táº¡o vĂ  xem lá»‹ch trĂ¬nh.");
        }
        return userRepository.findByEmail(email)
                .filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("TĂ i khoáº£n khĂ´ng tá»“n táº¡i hoáº·c Ä‘Ă£ bá»‹ khĂ³a."));
    }

    private void validateRequest(AiItineraryGenerateRequest request) {
        if (request == null) {
            throw new AppException("ThĂ´ng tin táº¡o lá»‹ch trĂ¬nh khĂ´ng há»£p lá»‡.");
        }
        if (request.getTotalDays() == null || request.getTotalDays() < 1 || request.getTotalDays() > 10) {
            throw new AppException("Sá»‘ ngĂ y lá»‹ch trĂ¬nh pháº£i tá»« 1 Ä‘áº¿n 10 ngĂ y.");
        }
        if (request.getTravelerCount() == null || request.getTravelerCount() < 1 || request.getTravelerCount() > 30) {
            throw new AppException("Sá»‘ khĂ¡ch pháº£i tá»« 1 Ä‘áº¿n 30 ngÆ°á»i.");
        }
        boolean hasDestination = notBlank(request.getDestinationKeyword()) || notBlank(request.getCity()) || notBlank(request.getProvince());
        if (!hasDestination && !hasAnyCustomPlace(request)) {
            throw new AppException("Vui lĂ²ng nháº­p Ä‘iá»ƒm Ä‘áº¿n hoáº·c thĂªm Ä‘á»‹a Ä‘iá»ƒm riĂªng.");
        }
    }

    private void applyResolvedDestination(AiItineraryGenerateRequest request, ResolvedDestination destination) {
        if (destination == null || !destination.hasDestination()) return;
        if (notBlank(destination.city())) {
            request.setCity(destination.city());
            request.setDestinationKeyword(destination.city());
        }
        if (notBlank(destination.province())) {
            request.setProvince(destination.province());
        }
    }

    private List<ActivitySuggestionResponse> mergeActivities(AiItineraryGenerateRequest request, ResolvedDestination destination) {
        List<ActivitySuggestionResponse> selected = activitySuggestionService.findByIds(request.getActivityIds()).stream()
                .filter(item -> item != null && item.getActivityId() != null)
                .filter(item -> activitySuggestionService.matchesDestination(item, destination))
                .toList();
        List<ActivitySuggestionResponse> suggested = activitySuggestionService.suggest(
                request.getDestinationKeyword(),
                request.getCity(),
                request.getProvince(),
                request.getTravelStyle(),
                request.getInterests(),
                18
        );
        Map<Integer, ActivitySuggestionResponse> merged = new LinkedHashMap<>();
        selected.forEach(item -> merged.put(item.getActivityId(), item));
        if (suggested != null) {
            suggested.stream()
                    .filter(item -> item != null && item.getActivityId() != null)
                    .forEach(item -> merged.putIfAbsent(item.getActivityId(), item));
        }
        return new ArrayList<>(merged.values());
    }

    private Map<String, Object> getSelectedHomestay(Integer homeId) {
        if (homeId == null) return Map.of();
        Homestay homestay = homestayRepository.findByHomeIdAndDeletedAtIsNull(homeId)
                .filter(this::isPublicHomestay)
                .orElseThrow(() -> new AppException("Homestay Ä‘Æ°á»£c chá»n khĂ´ng kháº£ dá»¥ng."));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("homeId", homestay.getHomeId());
        data.put("homeName", homestay.getHomeName());
        data.put("address", homestay.getHomeAddress());
        data.put("city", homestay.getCity());
        data.put("province", homestay.getProvince());
        data.put("latitude", homestay.getLatitude());
        data.put("longitude", homestay.getLongitude());
        data.put("description", homestay.getHomeDescription());
        data.put("maxGuest", homestay.getMaxGuest());
        data.put("pricePerNight", homestay.getPricePerNight());
        data.put("checkinTime", homestay.getCheckinTime());
        data.put("checkoutTime", homestay.getCheckoutTime());
        return data;
    }

    private boolean isPublicHomestay(Homestay homestay) {
        String status = homestay.getStatus() == null ? "" : homestay.getStatus().toUpperCase(Locale.ROOT);
        return PUBLIC_HOMESTAY_STATUSES.contains(status);
    }

    private List<ItineraryItem> buildItems(Integer userId,
                                           String itineraryCode,
                                           AiItineraryGenerateRequest request,
                                           JsonNode aiResult,
                                           List<ActivitySuggestionResponse> activities,
                                           Map<String, Object> selectedHomestay) {
        if (isMissing(aiResult)) return new ArrayList<>();
        List<ActivitySuggestionResponse> safeActivities = activities == null ? List.of() : activities;
        Map<String, Object> safeHomestay = selectedHomestay == null ? Map.of() : selectedHomestay;
        Set<Long> validActivityIds = safeActivities.stream()
                .map(ActivitySuggestionResponse::getActivityId)
                .filter(id -> id != null && id > 0)
                .map(Integer::longValue)
                .collect(Collectors.toCollection(HashSet::new));
        Long validHomestayId = readMapLong(safeHomestay, "homeId");
        String rawRequest = geminiItineraryService.toCompactJson(request);
        String rawAi = geminiItineraryService.toCompactJson(aiResult);
        String title = text(aiResult, "itineraryTitle", defaultTitle(request));
        String summary = text(aiResult, "summary", "");
        List<ItineraryItem> items = new ArrayList<>();
        JsonNode days = aiResult.path("days");
        if (!days.isArray()) return items;

        int displayOrder = 1;
        for (JsonNode dayNode : days) {
            int dayNumber = clampDay(readInt(dayNode, "dayNumber", Math.max(1, displayOrder)), request.getTotalDays());
            JsonNode aiItems = dayNode.path("items");
            if (!aiItems.isArray()) continue;
            for (JsonNode itemNode : aiItems) {
                String itemTitle = text(itemNode, "title", "");
                if (!notBlank(itemTitle)) continue;
                String sourceType = normalizeSourceType(text(itemNode, "sourceType", "AI_SUGGESTED"));
                Long sourceId = readLong(itemNode, "sourceId");
                Long activityId = readLong(itemNode, "activityId");
                if ("SYSTEM_ACTIVITY".equals(sourceType) && sourceId == null) {
                    sourceId = activityId;
                }
                if ("HOMESTAY".equals(sourceType) && sourceId == null) {
                    sourceId = readLong(itemNode, "homestayId");
                }

                if ("SYSTEM_ACTIVITY".equals(sourceType) && (sourceId == null || !validActivityIds.contains(sourceId))) {
                    sourceType = "AI_SUGGESTED";
                    sourceId = null;
                }
                if ("HOMESTAY".equals(sourceType) && (validHomestayId == null || !validHomestayId.equals(sourceId))) {
                    sourceType = "AI_SUGGESTED";
                    sourceId = null;
                }
                if (!"SYSTEM_ACTIVITY".equals(sourceType) && !"HOMESTAY".equals(sourceType)) {
                    sourceId = null;
                }

                items.add(ItineraryItem.builder()
                        .itineraryCode(itineraryCode)
                        .userId(userId)
                        .itineraryTitle(title)
                        .destinationKeyword(request.getDestinationKeyword())
                        .city(request.getCity())
                        .province(request.getProvince())
                        .startDate(request.getStartDate())
                        .totalDays(request.getTotalDays())
                        .travelerCount(request.getTravelerCount())
                        .travelStyle(defaultText(request.getTravelStyle(), "DISCOVERY"))
                        .pace(defaultText(request.getPace(), "MEDIUM"))
                        .itinerarySummary(summary)
                        .dayNumber(dayNumber)
                        .displayOrder(displayOrder++)
                        .startTime(readTime(itemNode, "startTime"))
                        .endTime(readTime(itemNode, "endTime"))
                        .durationMinutes(readIntNullable(itemNode, "durationMinutes"))
                        .preferredTimeOfDay(text(itemNode, "preferredTimeOfDay", null))
                        .fixedTime("USER_CUSTOM".equals(sourceType) && readBoolean(itemNode, "fixedTime", false))
                        .title(itemTitle)
                        .locationName(defaultText(text(itemNode, "address", null), itemTitle))
                        .address(text(itemNode, "address", null))
                        .itemType(defaultText(text(itemNode, "itemType", sourceType), "ACTIVITY"))
                        .sourceType(sourceType)
                        .sourceId(sourceId)
                        .activityId("SYSTEM_ACTIVITY".equals(sourceType) && sourceId != null ? sourceId.intValue() : null)
                        .homestayId("HOMESTAY".equals(sourceType) && sourceId != null ? sourceId.intValue() : null)
                        .latitude(readBigDecimal(itemNode, "latitude"))
                        .longitude(readBigDecimal(itemNode, "longitude"))
                        .estimatedCost(readBigDecimal(itemNode, "estimatedCost"))
                        .transportNote(text(itemNode, "transportNote", null))
                        .note(text(itemNode, "note", null))
                        .rawUserRequest(items.isEmpty() ? rawRequest : null)
                        .rawAiResponse(items.isEmpty() ? rawAi : null)
                        .itineraryStatus("ACTIVE")
                        .build());
            }
        }
        return items;
    }

    private void validateFixedCustomPlaceTimes(
            AiItineraryGenerateRequest request
    ) {
        if (request.getCustomPlaces() == null
                || request.getCustomPlaces().isEmpty()) {
            return;
        }

        List<TimeBlock> fixedBlocks = new ArrayList<>();

        for (CustomPlaceRequest place :
                request.getCustomPlaces()) {

            if (place == null) {
                continue;
            }

            /*
            * Chỉ kiểm tra các địa điểm có giờ cố định.
            */
            if (!Boolean.TRUE.equals(place.getFixedTime())) {
                continue;
            }

            LocalTime start =
                    parseTimeString(place.getStartTime());

            LocalTime enteredEnd =
                    parseTimeString(place.getEndTime());

            String currentTitle = firstNonBlank(
                    customPlaceTitle(place),
                    "địa điểm vừa nhập"
            );

            /*
            * Có giờ kết thúc nhưng thiếu giờ bắt đầu.
            */
            if (start == null && enteredEnd != null) {
                throw new AppException(
                        "Vui lòng nhập giờ bắt đầu cho \""
                                + currentTitle
                                + "\"."
                );
            }

            /*
            * Không có giờ thì AI được phép tự sắp xếp.
            */
            if (start == null) {
                continue;
            }

            /*
            * Đã nhập giờ chính xác thì phải chọn ngày.
            */
            if (place.getDayNumber() == null) {
                throw new AppException(
                        "Địa điểm \""
                                + currentTitle
                                + "\" đã có giờ cụ thể. "
                                + "Vui lòng chọn ngày."
                );
            }

            int day = place.getDayNumber();

            int totalDays = Math.max(
                    1,
                    request.getTotalDays() == null
                            ? 1
                            : request.getTotalDays()
            );

            if (day < 1 || day > totalDays) {
                throw new AppException(
                        "Ngày của địa điểm \""
                                + currentTitle
                                + "\" không hợp lệ."
                );
            }

            Integer duration =
                    place.getDurationMinutes() == null
                            || place.getDurationMinutes() < 15
                            ? 60
                            : place.getDurationMinutes();

            LocalTime end = enteredEnd;

            if (end == null) {
                end = start.plusMinutes(duration);
            }

            if (!end.isAfter(start)) {
                throw new AppException(
                        "Thời gian kết thúc của \""
                                + currentTitle
                                + "\" phải sau thời gian bắt đầu."
                );
            }

            TimeBlock current = new TimeBlock(
                    day,
                    start,
                    end,
                    currentTitle
            );

            for (TimeBlock existing : fixedBlocks) {
                if (existing.dayNumber()
                        != current.dayNumber()) {
                    continue;
                }

                /*
                * Hai hoạt động bị trùng thời gian.
                */
                if (overlaps(
                        existing.start(),
                        existing.end(),
                        current.start(),
                        current.end()
                )) {
                    throw new AppException(
                            "Địa điểm \""
                                    + current.title()
                                    + "\" bị trùng thời gian với \""
                                    + existing.title()
                                    + "\" trong ngày "
                                    + current.dayNumber()
                                    + "."
                    );
                }

                long gapMinutes =
                        calculateCustomPlaceGapMinutes(
                                existing,
                                current
                        );

                /*
                * Không trùng nhưng khoảng nghỉ dưới 15 phút.
                */
                if (gapMinutes >= 0
                        && gapMinutes
                        < MIN_CUSTOM_PLACE_GAP_MINUTES) {
                    throw new AppException(
                            "Cần ít nhất "
                                    + MIN_CUSTOM_PLACE_GAP_MINUTES
                                    + " phút di chuyển/nghỉ giữa \""
                                    + existing.title()
                                    + "\" và \""
                                    + current.title()
                                    + "\" trong ngày "
                                    + current.dayNumber()
                                    + ". Khoảng cách hiện tại chỉ có "
                                    + gapMinutes
                                    + " phút."
                    );
                }
            }

            fixedBlocks.add(current);
        }
    }

    private long calculateCustomPlaceGapMinutes(TimeBlock first,TimeBlock second) {
            /*
            * first kết thúc trước second bắt đầu.
            */
            if (!first.end().isAfter(second.start())) {
                return Duration.between(
                        first.end(),
                        second.start()
                ).toMinutes();
            }

            /*
            * second kết thúc trước first bắt đầu.
            */
            if (!second.end().isAfter(first.start())) {
                return Duration.between(
                        second.end(),
                        first.start()
                ).toMinutes();
            }

            /*
            * Hai hoạt động bị trùng thời gian.
            */
            return -1;
    }
    private boolean overlaps(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA != null && endA != null && startB != null && endB != null
                && startA.isBefore(endB) && startB.isBefore(endA);
    }

    private record TimeBlock(int dayNumber, LocalTime start, LocalTime end, String title) {
    }
    private Long readMapLong(Map<String, Object> data, String key) {
        Object value = data == null ? null : data.get(key);
        if (value instanceof Number number) return number.longValue();
        try {
            return value == null ? null : Long.parseLong(String.valueOf(value));
        } catch (Exception exception) {
            return null;
        }
    }

    private ItineraryResponse toResponse(
            List<ItineraryItem> items
    ) {
        return toResponse(
                items,
                List.of()
        );
    }

    private ItineraryResponse toResponse(
            List<ItineraryItem> items,
            List<ItineraryValidationViolation> extraViolations
    ) {
        if (items == null || items.isEmpty()) {
            throw new AppException(
                    "Không có dữ liệu lịch trình để hiển thị."
            );
        }

        ItineraryItem first =
                items.get(0);

        List<ItineraryValidationViolation> hardViolations =
                collectEditablePlanViolations(
                        items,
                        first.getTotalDays()
                );

        AiItineraryGenerateRequest originalRequest =
                readOriginalGenerateRequest(
                        first
                );

        if (originalRequest != null) {
            hardViolations =
                    mergeViolations(
                            hardViolations,
                            validateRequiredCustomPlacesPresent(
                                    items,
                                    originalRequest.getCustomPlaces()
                            )
                    );
        }

        List<ItineraryValidationViolation> allViolations =
                mergeViolations(
                        hardViolations,
                        extraViolations
                );

        allViolations =
                mergeViolations(
                        allViolations,
                        itineraryValidationService
                                .validateSoftWarnings(
                                        items
                                )
                );

        List<ItineraryValidationIssueResponse> issues =
                buildValidationIssues(
                        allViolations
                );

        boolean hasFatal =
                issues.stream()
                        .anyMatch(issue ->
                                "FATAL".equalsIgnoreCase(
                                        issue.getSeverity()
                                )
                        );

        ItineraryResponse response =
                summaryResponse(first);

        response.setValidationStatus(
                hasFatal
                        ? "ERROR"
                        : issues.isEmpty()
                                ? "VALID"
                                : "WARNING"
        );

        response.setWarningCount(
                (int) issues.stream()
                        .filter(issue ->
                                "WARNING".equalsIgnoreCase(
                                        issue.getSeverity()
                                )
                        )
                        .count()
        );

        response.setValidationIssues(
                issues
        );

        Map<Integer, List<ItineraryItem>> grouped =
                items.stream()
                        .sorted(
                                Comparator
                                        .comparing(
                                                ItineraryItem::getDayNumber
                                        )
                                        .thenComparing(
                                                ItineraryItem::getDisplayOrder
                                        )
                        )
                        .collect(
                                Collectors.groupingBy(
                                        ItineraryItem::getDayNumber,
                                        LinkedHashMap::new,
                                        Collectors.toList()
                                )
                        );

        /*
         * Đảm bảo frontend luôn nhận đủ ngày từ 1 -> totalDays.
         * Nếu AI bỏ sót một ngày, ngày đó vẫn hiện trống kèm warning để user thêm mục.
         */
        int expectedDays =
                Math.max(
                        1,
                        first.getTotalDays() == null
                                ? 1
                                : first.getTotalDays()
                );

        List<ItineraryDayResponse> days =
                new ArrayList<>();

        for (int dayNumber = 1;
             dayNumber <= expectedDays;
             dayNumber++) {

            List<ItineraryItem> dayItems =
                    grouped.getOrDefault(
                            dayNumber,
                            List.of()
                    );

            List<ItineraryItemResponse> itemResponses =
                    dayItems.stream()
                            .map(item ->
                                    itemResponse(
                                            item,
                                            issues
                                    )
                            )
                            .toList();

            days.add(
                    ItineraryDayResponse.builder()
                            .dayNumber(dayNumber)
                            .items(itemResponses)
                            .build()
            );
        }

        response.setDays(days);
        response.setItemCount(items.size());

        return response;
    }

    private ItineraryResponse summaryResponse(
            ItineraryItem item
    ) {
        String storedGenerationStatus =
                firstNonBlank(
                        item.getGenerationStatus(),
                        "SUCCESS"
                );

        return ItineraryResponse.builder()
                .itineraryCode(
                        item.getItineraryCode()
                )
                .itineraryTitle(
                        item.getItineraryTitle()
                )
                .destinationKeyword(
                        item.getDestinationKeyword()
                )
                .city(
                        item.getCity()
                )
                .province(
                        item.getProvince()
                )
                .startDate(
                        item.getStartDate()
                )
                .endDate(
                        item.getEndDate()
                )
                .totalDays(
                        item.getTotalDays()
                )
                .travelerCount(
                        item.getTravelerCount()
                )
                .travelStyle(
                        item.getTravelStyle()
                )
                .pace(
                        item.getPace()
                )
                .summary(
                        item.getItinerarySummary()
                )
                .itineraryStatus(
                        item.getItineraryStatus()
                )
                .generationStatus(
                        storedGenerationStatus
                )
                .validationStatus(
                        "WARNING".equalsIgnoreCase(
                                storedGenerationStatus
                        )
                                ? "WARNING"
                                : "VALID"
                )
                .warningCount(0)
                .createdAt(
                        item.getCreatedAt()
                )
                .build();
    }

    private ItineraryItemResponse itemResponse(
            ItineraryItem item
    ) {
        return itemResponse(
                item,
                List.of()
        );
    }

    private ItineraryItemResponse itemResponse(
            ItineraryItem item,
            List<ItineraryValidationIssueResponse> issues
    ) {
        List<ItineraryValidationIssueResponse> itemIssues =
                issues == null
                        ? List.of()
                        : issues.stream()
                                .filter(issue ->
                                        validationIssueMatchesItem(
                                                issue,
                                                item
                                        )
                                )
                                .toList();

        return ItineraryItemResponse.builder()
                .itemId(item.getItemId())
                .dayNumber(item.getDayNumber())
                .displayOrder(
                        item.getDisplayOrder()
                )
                .startTime(
                        item.getStartTime()
                )
                .endTime(
                        item.getEndTime()
                )
                .durationMinutes(
                        item.getDurationMinutes()
                )
                .preferredTimeOfDay(
                        item.getPreferredTimeOfDay()
                )
                .fixedTime(
                        item.getFixedTime()
                )
                .title(
                        item.getTitle()
                )
                .locationName(
                        item.getLocationName()
                )
                .address(
                        item.getAddress()
                )
                .itemType(
                        item.getItemType()
                )
                .sourceType(
                        item.getSourceType()
                )
                .sourceId(
                        item.getSourceId()
                )
                .activityId(
                        item.getActivityId()
                )
                .homestayId(
                        item.getHomestayId()
                )
                .latitude(
                        item.getLatitude()
                )
                .longitude(
                        item.getLongitude()
                )
                .estimatedCost(
                        item.getEstimatedCost()
                )
                .transportNote(
                        item.getTransportNote()
                )
                .note(
                        item.getNote()
                )
                .validationIssues(
                        itemIssues
                )
                .build();
    }

    private AiItineraryGenerateRequest readOriginalGenerateRequest(
            ItineraryItem first
    ) {
        if (first == null
                || !notBlank(
                        first.getRawUserRequest()
                )) {
            return null;
        }

        try {
            return objectMapper.readValue(
                    first.getRawUserRequest(),
                    AiItineraryGenerateRequest.class
            );
        } catch (Exception exception) {
            return null;
        }
    }

    private String createItineraryCode() {
        int suffix = 100000 + RANDOM.nextInt(900000);
        return "ITI-" + LocalDateTime.now().format(CODE_TIME) + "-" + suffix;
    }

    private String defaultTitle(AiItineraryGenerateRequest request) {
        String destination = firstNonBlank(request.getCity(), request.getDestinationKeyword(), request.getProvince(), "Cozygo");
        return "Lịch trình " + destination + " " + request.getTotalDays() + " ngày";
    }

    private String normalizeSourceType(String value) {
        String normalized = defaultText(value, "AI_SUGGESTED").toUpperCase(Locale.ROOT);
        if ("ACTIVITY".equals(normalized)) return "SYSTEM_ACTIVITY";
        return SOURCE_TYPES.contains(normalized) ? normalized : "AI_SUGGESTED";
    }

    private LocalTime readTime(JsonNode node, String field) {
        return isMissing(node) ? null : parseTimeString(text(node, field, null));
    }

    private LocalTime parseTimeString(String value) {
        if (!notBlank(value)) return null;
        try {
            String text = value.trim();
            return LocalTime.parse(text.length() == 5 ? text : text.substring(0, Math.min(5, text.length())));
        } catch (Exception exception) {
            return null;
        }
    }

    private Integer readInt(JsonNode node, String field, int fallback) {
        if (isMissing(node)) return fallback;
        JsonNode value = node.path(field);
        if (value.isNumber()) return value.asInt();
        try {
            return Integer.parseInt(value.asText());
        } catch (Exception exception) {
            return fallback;
        }
    }

    private Integer readIntNullable(JsonNode node, String field) {
        if (isMissing(node)) return null;
        JsonNode value = node.path(field);
        if (value == null || value.isNull() || value.isMissingNode() || value.asText().isBlank()) return null;
        if (value.isNumber()) return value.asInt();
        try {
            return Integer.parseInt(value.asText());
        } catch (Exception exception) {
            return null;
        }
    }

    private Boolean readBoolean(JsonNode node, String field, boolean fallback) {
        if (isMissing(node)) return fallback;
        JsonNode value = node.path(field);
        if (value == null || value.isNull() || value.isMissingNode()) return fallback;
        if (value.isBoolean()) return value.asBoolean();
        String text = value.asText();
        if ("true".equalsIgnoreCase(text) || "1".equals(text)) return true;
        if ("false".equalsIgnoreCase(text) || "0".equals(text)) return false;
        return fallback;
    }

    private Long readLong(JsonNode node, String field) {
        if (isMissing(node)) return null;
        JsonNode value = node.path(field);
        if (value == null || value.isNull() || value.isMissingNode()) return null;
        if (value.isNumber()) return value.asLong();
        try {
            return Long.parseLong(value.asText());
        } catch (Exception exception) {
            return null;
        }
    }

    private BigDecimal readBigDecimal(JsonNode node, String field) {
        if (isMissing(node)) return null;
        JsonNode value = node.path(field);
        if (value == null || value.isNull() || value.isMissingNode() || value.asText().isBlank()) return null;
        try {
            return new BigDecimal(value.asText());
        } catch (Exception exception) {
            return null;
        }
    }

    private String text(JsonNode node, String field, String fallback) {
        if (isMissing(node)) return fallback;
        JsonNode value = node.path(field);
        if (value == null || value.isNull() || value.isMissingNode()) return fallback;
        String text = value.asText();
        return text == null || text.isBlank() ? fallback : text.trim();
    }

    private boolean isMissing(JsonNode node) {
        return node == null || node.isNull() || node.isMissingNode();
    }

    private int clampDay(int dayNumber, int totalDays) {
        return Math.max(1, Math.min(dayNumber, totalDays));
    }

    private boolean hasAnyCustomPlace(AiItineraryGenerateRequest request) {
        return request.getCustomPlaces() != null
                && request.getCustomPlaces().stream().anyMatch(place -> notBlank(customPlaceTitle(place)));
    }

    private String customPlaceTitle(CustomPlaceRequest place) {
        return place == null ? null : place.displayTitle();
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }

    private String defaultText(String value, String fallback) {
        return notBlank(value) ? value.trim() : fallback;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (notBlank(value)) return value.trim();
        }
        return "";
    }
}
