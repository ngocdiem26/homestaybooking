package com.homestaybooking.service;

import com.homestaybooking.dto.request.AiItineraryGenerateRequest;
import com.homestaybooking.dto.request.CustomPlaceRequest;
import com.homestaybooking.dto.response.ActivitySuggestionResponse;
import com.homestaybooking.dto.response.ItineraryValidationViolation;
import com.homestaybooking.exception.ItineraryGenerationException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ItineraryPlanningConstraintService {

    public static final int TRAVEL_BUFFER_MINUTES = 15;
    public static final int DEFAULT_ACTIVITY_DURATION_MINUTES = 90;
    public static final int MIN_ACTIVITY_DURATION_MINUTES = 30;
    public static final LocalTime NORMAL_DAY_START = LocalTime.of(6, 0);
    public static final LocalTime NORMAL_DAY_END = LocalTime.of(22, 30);

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int SAME_DAY_PREPARATION_MINUTES = 30;

    public PlanningConstraints prepare(
            AiItineraryGenerateRequest request,
            List<ActivitySuggestionResponse> activityPool
    ) {
        if (request == null) {
            throw new ItineraryGenerationException(
                    "INVALID_ITINERARY_REQUEST",
                    "Thông tin tạo lịch trình không hợp lệ."
            );
        }

        int totalDays = Math.max(1, request.getTotalDays() == null ? 1 : request.getTotalDays());
        LocalTime firstDayEarliestStart = resolveFirstDayEarliestStart(request.getStartDate());

        List<ActivitySuggestionResponse> safeActivities = activityPool == null
                ? List.of()
                : activityPool.stream().filter(item -> item != null && item.getActivityId() != null).toList();

        Map<Integer, ActivitySuggestionResponse> activityById = safeActivities.stream()
                .collect(Collectors.toMap(
                        ActivitySuggestionResponse::getActivityId,
                        item -> item,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        Set<Integer> selectedIds = request.getActivityIds() == null
                ? Set.of()
                : request.getActivityIds().stream()
                        .filter(id -> id != null && id > 0)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        List<TimeBlock> occupiedBlocks = buildFixedCustomBlocks(request);
        List<ActivityConstraint> allActivityConstraints = safeActivities.stream()
                .map(activity -> toActivityConstraint(activity, selectedIds.contains(activity.getActivityId())))
                .toList();

        Map<Integer, ActivityConstraint> constraintById = allActivityConstraints.stream()
                .collect(Collectors.toMap(
                        ActivityConstraint::activityId,
                        constraint -> constraint,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<ItineraryValidationViolation> precheckViolations = new ArrayList<>();

        for (Integer selectedId : selectedIds) {
            if (!activityById.containsKey(selectedId)) {
                precheckViolations.add(new ItineraryValidationViolation(
                        null,
                        null,
                        selectedId,
                        null,
                        null,
                        null,
                        "Hoạt động đã chọn không còn khả dụng hoặc không thuộc đúng điểm đến hiện tại."
                ));
            }
        }

        if (!precheckViolations.isEmpty()) {
            throw new ItineraryGenerationException(
                    "SELECTED_ACTIVITY_NOT_AVAILABLE",
                    "Có hoạt động bạn đã chọn không còn khả dụng cho điểm đến này.",
                    precheckViolations
            );
        }

        List<ActivityConstraint> mandatoryConstraints = selectedIds.stream()
                .map(constraintById::get)
                .filter(constraint -> constraint != null)
                .sorted(Comparator
                        .comparingInt(ActivityConstraint::availableWindowMinutes)
                        .thenComparing(ActivityConstraint::activityId))
                .toList();

        List<LockedActivitySlot> lockedSelectedActivities = new ArrayList<>();

        for (ActivityConstraint constraint : mandatoryConstraints) {
            LockedActivitySlot slot = findSlot(
                    constraint,
                    totalDays,
                    firstDayEarliestStart,
                    occupiedBlocks,
                    lockedSelectedActivities
            );

            if (slot == null) {
                precheckViolations.add(new ItineraryValidationViolation(
                        null,
                        constraint.activityName(),
                        constraint.activityId(),
                        null,
                        constraint.openingTime(),
                        constraint.closingTime(),
                        "Không tìm được khung giờ hợp lệ cho hoạt động đã chọn sau khi xét giờ mở cửa, thời lượng, địa điểm cố định và thời gian di chuyển."
                ));
                continue;
            }

            lockedSelectedActivities.add(slot);
            occupiedBlocks.add(new TimeBlock(
                    slot.dayNumber(),
                    slot.startTime(),
                    slot.endTime(),
                    slot.activityName(),
                    true
            ));
        }

        if (!precheckViolations.isEmpty()) {
            throw new ItineraryGenerationException(
                    "SELECTED_ACTIVITY_TIME_CONSTRAINT_FAILED",
                    "Một số hoạt động bạn đã chọn không thể xếp vào lịch hiện tại. Hãy đổi ngày, tăng số ngày hoặc bỏ bớt hoạt động cố định.",
                    precheckViolations
            );
        }

        List<LockedCustomPlace> lockedCustomPlaces = buildLockedCustomPlaces(request);
        List<String> requiredCustomPlaceTitles = request.getCustomPlaces() == null
                ? List.of()
                : request.getCustomPlaces().stream()
                        .map(CustomPlaceRequest::displayTitle)
                        .filter(title -> title != null && !title.isBlank())
                        .map(String::trim)
                        .toList();

        return new PlanningConstraints(
                totalDays,
                NORMAL_DAY_START,
                NORMAL_DAY_END,
                firstDayEarliestStart,
                TRAVEL_BUFFER_MINUTES,
                allActivityConstraints,
                lockedSelectedActivities,
                lockedCustomPlaces,
                requiredCustomPlaceTitles
        );
    }

    private LocalTime resolveFirstDayEarliestStart(LocalDate startDate) {
        if (startDate == null) {
            return NORMAL_DAY_START;
        }

        ZonedDateTime now = ZonedDateTime.now(VIETNAM_ZONE);
        LocalDate today = now.toLocalDate();

        if (startDate.isBefore(today)) {
            throw new ItineraryGenerationException(
                    "ITINERARY_START_DATE_IN_PAST",
                    "Ngày bắt đầu lịch trình không được nằm trong quá khứ."
            );
        }

        if (!startDate.equals(today)) {
            return NORMAL_DAY_START;
        }

        ZonedDateTime readyAt = now.plusMinutes(SAME_DAY_PREPARATION_MINUTES);
        if (!readyAt.toLocalDate().equals(today)) {
            throw new ItineraryGenerationException(
                    "ITINERARY_START_TOO_LATE_TODAY",
                    "Hôm nay đã quá muộn để tạo một ngày lịch trình hợp lý. Vui lòng chọn ngày bắt đầu từ ngày mai."
            );
        }

        LocalTime earliest = roundUpToQuarterHour(readyAt.toLocalTime());

        if (!earliest.isBefore(NORMAL_DAY_END)) {
            throw new ItineraryGenerationException(
                    "ITINERARY_START_TOO_LATE_TODAY",
                    "Hôm nay đã quá muộn để tạo một ngày lịch trình hợp lý. Vui lòng chọn ngày bắt đầu từ ngày mai."
            );
        }

        return earliest.isBefore(NORMAL_DAY_START)
                ? NORMAL_DAY_START
                : earliest;
    }

    private List<TimeBlock> buildFixedCustomBlocks(AiItineraryGenerateRequest request) {
        if (request.getCustomPlaces() == null || request.getCustomPlaces().isEmpty()) {
            return new ArrayList<>();
        }

        List<TimeBlock> blocks = new ArrayList<>();

        for (CustomPlaceRequest place : request.getCustomPlaces()) {
            if (place == null || !Boolean.TRUE.equals(place.getFixedTime())) {
                continue;
            }

            LocalTime start = parseTime(place.getStartTime());
            if (start == null || place.getDayNumber() == null) {
                continue;
            }

            LocalTime end = parseTime(place.getEndTime());
            int duration = safeCustomDuration(place);
            if (end == null) {
                end = start.plusMinutes(duration);
            }

            blocks.add(new TimeBlock(
                    place.getDayNumber(),
                    start,
                    end,
                    safeTitle(place),
                    true
            ));
        }

        return blocks;
    }

    private List<LockedCustomPlace> buildLockedCustomPlaces(AiItineraryGenerateRequest request) {
        if (request.getCustomPlaces() == null || request.getCustomPlaces().isEmpty()) {
            return List.of();
        }

        List<LockedCustomPlace> result = new ArrayList<>();

        for (CustomPlaceRequest place : request.getCustomPlaces()) {
            if (place == null || !Boolean.TRUE.equals(place.getFixedTime())) {
                continue;
            }

            LocalTime start = parseTime(place.getStartTime());
            if (start == null || place.getDayNumber() == null) {
                continue;
            }

            LocalTime end = parseTime(place.getEndTime());
            int duration = safeCustomDuration(place);
            if (end == null) {
                end = start.plusMinutes(duration);
            }

            result.add(new LockedCustomPlace(
                    safeTitle(place),
                    place.getDayNumber(),
                    start,
                    end,
                    duration,
                    place.getAddress(),
                    place.getItemType(),
                    place.getNote()
            ));
        }

        return result;
    }

    private ActivityConstraint toActivityConstraint(
            ActivitySuggestionResponse activity,
            boolean mandatory
    ) {
        LocalTime opening = activity.getOpeningTime() == null
                ? LocalTime.of(8, 0)
                : activity.getOpeningTime();
        LocalTime closing = activity.getClosingTime() == null
                ? LocalTime.of(18, 0)
                : activity.getClosingTime();

        int availableWindowMinutes = calculateWindowMinutes(opening, closing);

        if (availableWindowMinutes < MIN_ACTIVITY_DURATION_MINUTES) {
            throw new ItineraryGenerationException(
                    "INVALID_ACTIVITY_OPENING_WINDOW",
                    "Hoạt động \"" + activity.getActivityName() + "\" có khung giờ hoạt động quá ngắn hoặc không hợp lệ."
            );
        }

        int recommended = activity.getRecommendedDurationMinutes() == null
                || activity.getRecommendedDurationMinutes() < MIN_ACTIVITY_DURATION_MINUTES
                ? DEFAULT_ACTIVITY_DURATION_MINUTES
                : activity.getRecommendedDurationMinutes();

        /*
         * recommendedDurationMinutes là thời lượng gợi ý, không phải luật tuyệt đối.
         * Nếu dữ liệu khuyến nghị dài hơn toàn bộ giờ mở cửa, giảm planningDuration
         * xuống đúng phần thời gian có thể sử dụng thay vì loại hoạt động ngay.
         */
        int planningDuration = Math.min(recommended, availableWindowMinutes);
        planningDuration = Math.max(MIN_ACTIVITY_DURATION_MINUTES, planningDuration);

        LocalTime latestStart = closing.minusMinutes(planningDuration);

        return new ActivityConstraint(
                activity.getActivityId(),
                activity.getActivityName(),
                mandatory,
                opening,
                closing,
                activity.getRecommendedDurationMinutes(),
                planningDuration,
                opening,
                latestStart,
                availableWindowMinutes,
                activity.getBestTimeOfDay(),
                activity.getActivityIntensity(),
                activity.getCity(),
                activity.getProvince()
        );
    }

    private LockedActivitySlot findSlot(
            ActivityConstraint constraint,
            int totalDays,
            LocalTime firstDayEarliestStart,
            List<TimeBlock> occupiedBlocks,
            List<LockedActivitySlot> alreadyLockedActivities
    ) {
        Map<Integer, Long> lockedCountByDay = alreadyLockedActivities == null
                ? Map.of()
                : alreadyLockedActivities.stream().collect(Collectors.groupingBy(
                        LockedActivitySlot::dayNumber,
                        Collectors.counting()
                ));

        List<Integer> dayOrder = java.util.stream.IntStream
                .rangeClosed(1, totalDays)
                .boxed()
                .sorted(Comparator
                        .comparingLong((Integer day) -> lockedCountByDay.getOrDefault(day, 0L))
                        .thenComparingInt(Integer::intValue))
                .toList();

        for (int day : dayOrder) {
            LocalTime earliest = max(
                    constraint.allowedStartFrom(),
                    NORMAL_DAY_START,
                    day == 1 ? firstDayEarliestStart : NORMAL_DAY_START
            );

            LocalTime latest = min(
                    constraint.allowedStartTo(),
                    NORMAL_DAY_END.minusMinutes(constraint.planningDurationMinutes())
            );

            if (latest.isBefore(earliest)) {
                continue;
            }

            LocalTime preferred = preferredStart(constraint.bestTimeOfDay());
            LocalTime firstCandidate = clamp(preferred, earliest, latest);

            LocalTime slot = searchForward(
                    day,
                    firstCandidate,
                    latest,
                    constraint.planningDurationMinutes(),
                    occupiedBlocks
            );

            if (slot == null && firstCandidate.isAfter(earliest)) {
                slot = searchForward(
                        day,
                        earliest,
                        firstCandidate.minusMinutes(TRAVEL_BUFFER_MINUTES),
                        constraint.planningDurationMinutes(),
                        occupiedBlocks
                );
            }

            if (slot != null) {
                return new LockedActivitySlot(
                        constraint.activityId(),
                        constraint.activityName(),
                        day,
                        slot,
                        slot.plusMinutes(constraint.planningDurationMinutes()),
                        constraint.planningDurationMinutes(),
                        constraint.openingTime(),
                        constraint.closingTime()
                );
            }
        }

        return null;
    }

    private LocalTime searchForward(
            int day,
            LocalTime start,
            LocalTime latest,
            int durationMinutes,
            List<TimeBlock> occupiedBlocks
    ) {
        if (start == null || latest == null || latest.isBefore(start)) {
            return null;
        }

        for (LocalTime cursor = roundUpToQuarterHour(start);
             !cursor.isAfter(latest);
             cursor = cursor.plusMinutes(TRAVEL_BUFFER_MINUTES)) {

            LocalTime end = cursor.plusMinutes(durationMinutes);
            if (end.isAfter(NORMAL_DAY_END)) {
                break;
            }

            if (isFree(day, cursor, end, occupiedBlocks)) {
                return cursor;
            }
        }

        return null;
    }

    private boolean isFree(
            int day,
            LocalTime start,
            LocalTime end,
            List<TimeBlock> occupiedBlocks
    ) {
        for (TimeBlock block : occupiedBlocks) {
            if (block.dayNumber() != day) {
                continue;
            }

            LocalTime bufferedStart = block.start().minusMinutes(TRAVEL_BUFFER_MINUTES);
            LocalTime bufferedEnd = block.end().plusMinutes(TRAVEL_BUFFER_MINUTES);

            if (start.isBefore(bufferedEnd) && bufferedStart.isBefore(end)) {
                return false;
            }
        }

        return true;
    }

    private LocalTime preferredStart(String bestTimeOfDay) {
        String value = bestTimeOfDay == null
                ? "ANY"
                : bestTimeOfDay.trim().toUpperCase(Locale.ROOT);

        return switch (value) {
            case "MORNING" -> LocalTime.of(8, 30);
            case "AFTERNOON" -> LocalTime.of(14, 0);
            case "EVENING" -> LocalTime.of(18, 0);
            default -> LocalTime.of(9, 0);
        };
    }

    private LocalTime roundUpToQuarterHour(LocalTime time) {
        int minute = time.getMinute();
        int remainder = minute % TRAVEL_BUFFER_MINUTES;
        LocalTime rounded = time.withSecond(0).withNano(0);
        if (remainder == 0) {
            return rounded;
        }
        return rounded.plusMinutes(TRAVEL_BUFFER_MINUTES - remainder);
    }

    private LocalTime clamp(LocalTime value, LocalTime min, LocalTime max) {
        if (value.isBefore(min)) return min;
        if (value.isAfter(max)) return max;
        return value;
    }

    private LocalTime max(LocalTime... values) {
        LocalTime result = values[0];
        for (LocalTime value : values) {
            if (value != null && value.isAfter(result)) {
                result = value;
            }
        }
        return result;
    }

    private LocalTime min(LocalTime... values) {
        LocalTime result = values[0];
        for (LocalTime value : values) {
            if (value != null && value.isBefore(result)) {
                result = value;
            }
        }
        return result;
    }

    private int calculateWindowMinutes(LocalTime opening, LocalTime closing) {
        if (opening == null || closing == null || !closing.isAfter(opening)) {
            return 0;
        }
        return Math.toIntExact(Duration.between(opening, closing).toMinutes());
    }

    private int safeCustomDuration(CustomPlaceRequest place) {
        if (place.getDurationMinutes() != null && place.getDurationMinutes() >= 15) {
            return place.getDurationMinutes();
        }

        LocalTime start = parseTime(place.getStartTime());
        LocalTime end = parseTime(place.getEndTime());
        if (start != null && end != null && end.isAfter(start)) {
            return Math.toIntExact(Duration.between(start, end).toMinutes());
        }

        return 60;
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalTime.parse(value.trim());
        } catch (Exception ignored) {
            return null;
        }
    }

    private String safeTitle(CustomPlaceRequest place) {
        String title = place == null ? null : place.displayTitle();
        return title == null || title.isBlank() ? "Địa điểm riêng" : title.trim();
    }

    private record TimeBlock(
            int dayNumber,
            LocalTime start,
            LocalTime end,
            String title,
            boolean locked
    ) {
    }

    public record PlanningConstraints(
            int totalDays,
            LocalTime normalDayStart,
            LocalTime normalDayEnd,
            LocalTime firstDayEarliestStart,
            int travelBufferMinutes,
            List<ActivityConstraint> activityConstraints,
            List<LockedActivitySlot> lockedSelectedActivities,
            List<LockedCustomPlace> lockedCustomPlaces,
            List<String> requiredCustomPlaceTitles
    ) {
        public Map<String, Object> asPromptPayload() {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("totalDays", totalDays);
            payload.put("normalDayStart", timeText(normalDayStart));
            payload.put("normalDayEnd", timeText(normalDayEnd));
            payload.put("firstDayEarliestStart", timeText(firstDayEarliestStart));
            payload.put("travelBufferMinutes", travelBufferMinutes);

            payload.put(
                    "activityConstraints",
                    activityConstraints == null
                            ? List.of()
                            : activityConstraints.stream()
                                    .map(ActivityConstraint::asPromptPayload)
                                    .toList()
            );

            payload.put(
                    "lockedSelectedActivities",
                    lockedSelectedActivities == null
                            ? List.of()
                            : lockedSelectedActivities.stream()
                                    .map(LockedActivitySlot::asPromptPayload)
                                    .toList()
            );

            payload.put(
                    "lockedCustomPlaces",
                    lockedCustomPlaces == null
                            ? List.of()
                            : lockedCustomPlaces.stream()
                                    .map(LockedCustomPlace::asPromptPayload)
                                    .toList()
            );

            payload.put(
                    "requiredCustomPlaceTitles",
                    requiredCustomPlaceTitles == null
                            ? List.of()
                            : requiredCustomPlaceTitles
            );
            return payload;
        }

        private String timeText(LocalTime value) {
            return value == null ? null : value.toString();
        }

        public Map<Integer, LockedActivitySlot> lockedSelectedById() {
            if (lockedSelectedActivities == null) return Map.of();
            return lockedSelectedActivities.stream().collect(Collectors.toMap(
                    LockedActivitySlot::activityId,
                    slot -> slot,
                    (left, right) -> left,
                    HashMap::new
            ));
        }
    }

    public record ActivityConstraint(
            Integer activityId,
            String activityName,
            boolean mandatory,
            LocalTime openingTime,
            LocalTime closingTime,
            Integer recommendedDurationMinutes,
            int planningDurationMinutes,
            LocalTime allowedStartFrom,
            LocalTime allowedStartTo,
            int availableWindowMinutes,
            String bestTimeOfDay,
            String activityIntensity,
            String city,
            String province
    ) {
        public Map<String, Object> asPromptPayload() {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("activityId", activityId);
            payload.put("activityName", activityName);
            payload.put("mandatory", mandatory);
            payload.put("openingTime", openingTime == null ? null : openingTime.toString());
            payload.put("closingTime", closingTime == null ? null : closingTime.toString());
            payload.put("recommendedDurationMinutes", recommendedDurationMinutes);
            payload.put("planningDurationMinutes", planningDurationMinutes);
            payload.put("allowedStartFrom", allowedStartFrom == null ? null : allowedStartFrom.toString());
            payload.put("allowedStartTo", allowedStartTo == null ? null : allowedStartTo.toString());
            payload.put("availableWindowMinutes", availableWindowMinutes);
            payload.put("bestTimeOfDay", bestTimeOfDay);
            payload.put("activityIntensity", activityIntensity);
            payload.put("city", city);
            payload.put("province", province);
            return payload;
        }
    }

    public record LockedActivitySlot(
            Integer activityId,
            String activityName,
            int dayNumber,
            LocalTime startTime,
            LocalTime endTime,
            int durationMinutes,
            LocalTime openingTime,
            LocalTime closingTime
    ) {
        public Map<String, Object> asPromptPayload() {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("activityId", activityId);
            payload.put("activityName", activityName);
            payload.put("dayNumber", dayNumber);
            payload.put("startTime", startTime == null ? null : startTime.toString());
            payload.put("endTime", endTime == null ? null : endTime.toString());
            payload.put("durationMinutes", durationMinutes);
            payload.put("openingTime", openingTime == null ? null : openingTime.toString());
            payload.put("closingTime", closingTime == null ? null : closingTime.toString());
            return payload;
        }
    }

    public record LockedCustomPlace(
            String title,
            int dayNumber,
            LocalTime startTime,
            LocalTime endTime,
            int durationMinutes,
            String address,
            String itemType,
            String note
    ) {
        public Map<String, Object> asPromptPayload() {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("title", title);
            payload.put("dayNumber", dayNumber);
            payload.put("startTime", startTime == null ? null : startTime.toString());
            payload.put("endTime", endTime == null ? null : endTime.toString());
            payload.put("durationMinutes", durationMinutes);
            payload.put("address", address);
            payload.put("itemType", itemType);
            payload.put("note", note);
            return payload;
        }
    }
}
