package com.homestaybooking.service;

import com.homestaybooking.dto.response.ItineraryValidationViolation;
import com.homestaybooking.entity.ItineraryItem;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItineraryValidationService {

    private static final int MIN_TRAVEL_BUFFER_MINUTES = 15;
    private static final LocalTime EARLIEST_REASONABLE_START = LocalTime.of(6, 0);
    private static final LocalTime LATEST_REASONABLE_END = LocalTime.of(22, 30);

    private static final Set<String> VALID_SOURCE_TYPES = Set.of(
            "SYSTEM_ACTIVITY",
            "HOMESTAY",
            "USER_CUSTOM",
            "MEAL",
            "REST",
            "TRANSPORT",
            "FREE_TIME",
            "AI_SUGGESTED"
    );

    private static final Set<String> PLACE_BASED_SOURCE_TYPES = Set.of(
            "SYSTEM_ACTIVITY",
            "HOMESTAY",
            "USER_CUSTOM",
            "AI_SUGGESTED"
    );

    private final JdbcTemplate jdbcTemplate;

    /**
     * HARD validation: chỉ các lỗi có thể làm lịch trình sai nghiệp vụ mới chặn lưu.
     * Meal window, bestTimeOfDay, pace... là soft preference nên không nằm ở đây.
     */
    public ValidationResult validate(List<ItineraryItem> items, int totalDays) {
        return validate(items, loadActivities(items), totalDays);
    }

    public ValidationResult validate(
            List<ItineraryItem> items,
            Map<Integer, ActivitySchedule> activities,
            int totalDays
    ) {
        List<ItineraryValidationViolation> violations = new ArrayList<>();

        if (items == null || items.isEmpty()) {
            violations.add(violation(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "Lịch trình không có mục nào."
            ));
            return new ValidationResult(violations);
        }

        for (ItineraryItem item : items) {
            item.setSourceType(normalizeSourceType(item.getSourceType()));

            violations.addAll(validateSourceType(item));
            violations.addAll(validateDayNumber(item, totalDays));

            if (isSystemActivity(item)) {
                ActivitySchedule activity = activities.get(activityId(item));
                violations.addAll(validateActivityExists(item, activity));

                if (activity != null) {
                    violations.addAll(validateDuration(item, activity));
                    violations.addAll(validateActivityOpeningHours(item, activity));
                }
            } else {
                ensureEndTimeFromOwnDuration(item);
            }

            violations.addAll(validateReasonableDailyTime(item));
        }

        violations.addAll(validateNoTimeOverlap(items));
        violations.addAll(validateTravelBuffer(items));

        return new ValidationResult(violations);
    }

    /**
     * Soft warning không chặn lưu. Có thể dùng sau này để hiển thị cảnh báo UI.
     */
    public List<ItineraryValidationViolation> validateSoftWarnings(List<ItineraryItem> items) {
        if (items == null || items.isEmpty()) return List.of();

        List<ItineraryValidationViolation> warnings = new ArrayList<>();
        for (ItineraryItem item : items) {
            warnings.addAll(validateMealTime(item));
        }
        return warnings;
    }

    public List<ItineraryValidationViolation> validateActivityExists(
            ItineraryItem item,
            ActivitySchedule activity
    ) {
        if (activity != null) return List.of();

        return List.of(violation(
                item.getDayNumber(),
                item.getTitle(),
                activityId(item),
                generatedTime(item),
                null,
                null,
                "Hoạt động hệ thống không tồn tại hoặc không còn hoạt động."
        ));
    }

    public List<ItineraryValidationViolation> validateActivityOpeningHours(
            ItineraryItem item,
            ActivitySchedule activity
    ) {
        if (item.getStartTime() == null || item.getEndTime() == null) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activity.activityId(),
                    generatedTime(item),
                    activity.openingTime(),
                    activity.closingTime(),
                    "Thiếu giờ bắt đầu hoặc kết thúc."
            ));
        }

        if (!item.getEndTime().isAfter(item.getStartTime())) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activity.activityId(),
                    generatedTime(item),
                    activity.openingTime(),
                    activity.closingTime(),
                    "Giờ kết thúc phải sau giờ bắt đầu."
            ));
        }

        if (activity.openingTime() == null || activity.closingTime() == null) {
            return List.of();
        }

        boolean valid = !item.getStartTime().isBefore(activity.openingTime())
                && !item.getEndTime().isAfter(activity.closingTime());

        if (valid) return List.of();

        return List.of(violation(
                item.getDayNumber(),
                item.getTitle(),
                activity.activityId(),
                generatedTime(item),
                activity.openingTime(),
                activity.closingTime(),
                "Hoạt động nằm ngoài giờ mở cửa."
        ));
    }

    /**
     * recommendedDurationMinutes chỉ là giá trị gợi ý.
     * Backend KHÔNG bắt AI phải dùng đúng tuyệt đối giá trị này.
     * Nếu AI đã cung cấp start/end hợp lệ thì lấy thời lượng thực tế.
     */
    public List<ItineraryValidationViolation> validateDuration(
            ItineraryItem item,
            ActivitySchedule activity
    ) {
        if (item.getStartTime() == null) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activity.activityId(),
                    generatedTime(item),
                    activity.openingTime(),
                    activity.closingTime(),
                    "Thiếu giờ bắt đầu."
            ));
        }

        Integer duration = null;

        if (item.getEndTime() != null
                && item.getEndTime().isAfter(item.getStartTime())) {
            duration = Math.toIntExact(
                    Duration.between(
                            item.getStartTime(),
                            item.getEndTime()
                    ).toMinutes()
            );
        }

        if ((duration == null || duration <= 0)
                && item.getDurationMinutes() != null
                && item.getDurationMinutes() > 0) {
            duration = item.getDurationMinutes();
        }

        if ((duration == null || duration <= 0)
                && activity.recommendedDurationMinutes() != null
                && activity.recommendedDurationMinutes() > 0) {
            duration = activity.recommendedDurationMinutes();
        }

        if (duration == null || duration <= 0) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activity.activityId(),
                    generatedTime(item),
                    activity.openingTime(),
                    activity.closingTime(),
                    "Không xác định được thời lượng hoạt động."
            ));
        }

        item.setDurationMinutes(duration);

        if (item.getEndTime() == null
                || !item.getEndTime().isAfter(item.getStartTime())) {
            item.setEndTime(item.getStartTime().plusMinutes(duration));
        }

        return List.of();
    }

    public List<ItineraryValidationViolation> validateReasonableDailyTime(ItineraryItem item) {
        if (item == null
                || item.getStartTime() == null
                || item.getEndTime() == null) {
            return List.of();
        }

        if (!item.getEndTime().isAfter(item.getStartTime())) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activityId(item),
                    generatedTime(item),
                    null,
                    null,
                    "Giờ kết thúc phải sau giờ bắt đầu. Lịch trình chưa hỗ trợ một mục kéo dài qua ngày hôm sau."
            ));
        }

        /*
         * USER_CUSTOM fixedTime là dữ liệu người dùng chủ động khóa,
         * vì vậy backend tôn trọng kể cả ngoài 06:00-22:30.
         */
        if (isFixedUserCustomItem(item)) {
            return List.of();
        }

        if (item.getStartTime().isBefore(EARLIEST_REASONABLE_START)
                || item.getEndTime().isAfter(LATEST_REASONABLE_END)) {
            return List.of(violation(
                    item.getDayNumber(),
                    item.getTitle(),
                    activityId(item),
                    generatedTime(item),
                    EARLIEST_REASONABLE_START,
                    LATEST_REASONABLE_END,
                    "Mục do hệ thống/AI sắp xếp phải nằm trong khoảng 06:00-22:30."
            ));
        }

        return List.of();
    }

    /**
     * Đây là SOFT rule, chỉ dùng để cảnh báo.
     */
    public List<ItineraryValidationViolation> validateMealTime(ItineraryItem item) {
        if (item == null || isFixedUserCustomItem(item)) return List.of();
        if (item.getStartTime() == null || item.getEndTime() == null) return List.of();

        String text = plainText(
                safeText(item.getTitle())
                        + " "
                        + safeText(item.getAddress())
                        + " "
                        + safeText(item.getItemType())
                        + " "
                        + safeText(item.getSourceType())
        );

        TimeWindow window = null;

        if (text.contains("breakfast")
                || text.contains("an sang")
                || text.contains("bua sang")) {
            window = new TimeWindow(
                    LocalTime.of(6, 0),
                    LocalTime.of(9, 30),
                    "Bữa sáng nên nằm trong khoảng 06:00-09:30."
            );
        } else if (text.contains("lunch")
                || text.contains("an trua")
                || text.contains("bua trua")) {
            window = new TimeWindow(
                    LocalTime.of(10, 30),
                    LocalTime.of(13, 30),
                    "Bữa trưa nên nằm trong khoảng 10:30-13:30."
            );
        } else if (text.contains("dinner")
                || text.contains("an toi")
                || text.contains("bua toi")) {
            window = new TimeWindow(
                    LocalTime.of(17, 30),
                    LocalTime.of(20, 30),
                    "Bữa tối nên nằm trong khoảng 17:30-20:30."
            );
        }

        if (window == null) return List.of();

        boolean valid = !item.getStartTime().isBefore(window.start())
                && !item.getEndTime().isAfter(window.end());

        if (valid) return List.of();

        return List.of(violation(
                item.getDayNumber(),
                item.getTitle(),
                activityId(item),
                generatedTime(item),
                window.start(),
                window.end(),
                window.reason()
        ));
    }

    public List<ItineraryValidationViolation> validateNoTimeOverlap(List<ItineraryItem> items) {
        List<ItineraryValidationViolation> violations = new ArrayList<>();

        groupedByDay(items).forEach((day, dayItems) -> {
            List<ItineraryItem> sorted = timedItems(dayItems);

            for (int index = 1; index < sorted.size(); index++) {
                ItineraryItem previous = sorted.get(index - 1);
                ItineraryItem current = sorted.get(index);

                if (current.getStartTime().isBefore(previous.getEndTime())) {
                    violations.add(violation(
                            current.getDayNumber(),
                            current.getTitle(),
                            activityId(current),
                            generatedTime(current),
                            null,
                            null,
                            "Hoạt động bị chồng thời gian với \"" + previous.getTitle() + "\"."
                    ));
                }
            }
        });

        return violations;
    }

    /**
     * Chỉ áp buffer cứng giữa hai mục thực sự là hai địa điểm cần di chuyển.
     * REST/MEAL/FREE_TIME/TRANSPORT không tự động bị ép thêm 15 phút.
     */
    public List<ItineraryValidationViolation> validateTravelBuffer(List<ItineraryItem> items) {
        List<ItineraryValidationViolation> violations = new ArrayList<>();

        groupedByDay(items).forEach((day, dayItems) -> {
            List<ItineraryItem> sorted = timedItems(dayItems);

            for (int index = 1; index < sorted.size(); index++) {
                ItineraryItem previous = sorted.get(index - 1);
                ItineraryItem current = sorted.get(index);

                if (!requiresTravelBuffer(previous)
                        || !requiresTravelBuffer(current)
                        || samePlace(previous, current)) {
                    continue;
                }

                if (current.getStartTime().isBefore(previous.getEndTime())) {
                    continue;
                }

                long gap = Duration.between(
                        previous.getEndTime(),
                        current.getStartTime()
                ).toMinutes();

                if (gap < MIN_TRAVEL_BUFFER_MINUTES) {
                    violations.add(violation(
                            current.getDayNumber(),
                            current.getTitle(),
                            activityId(current),
                            generatedTime(current),
                            null,
                            null,
                            "Cần ít nhất 15 phút di chuyển/nghỉ giữa hai địa điểm khác nhau."
                    ));
                }
            }
        });

        return violations;
    }

    public List<ItineraryValidationViolation> validateDayNumber(
            ItineraryItem item,
            int totalDays
    ) {
        Integer dayNumber = item.getDayNumber();
        if (dayNumber != null
                && dayNumber >= 1
                && dayNumber <= Math.max(1, totalDays)) {
            return List.of();
        }

        return List.of(violation(
                dayNumber,
                item.getTitle(),
                activityId(item),
                generatedTime(item),
                null,
                null,
                "Ngày trong lịch trình không hợp lệ."
        ));
    }

    public List<ItineraryValidationViolation> validateSourceType(ItineraryItem item) {
        String sourceType = normalizeSourceType(item.getSourceType());
        if (VALID_SOURCE_TYPES.contains(sourceType)) return List.of();

        return List.of(violation(
                item.getDayNumber(),
                item.getTitle(),
                activityId(item),
                generatedTime(item),
                null,
                null,
                "sourceType không hợp lệ."
        ));
    }

    public Map<Integer, ActivitySchedule> loadActivities(List<ItineraryItem> items) {
        Set<Integer> ids = items == null
                ? Set.of()
                : items.stream()
                        .filter(this::isSystemActivity)
                        .map(this::activityId)
                        .filter(id -> id != null && id > 0)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        if (ids.isEmpty() || jdbcTemplate == null) return Map.of();

        String placeholders = ids.stream()
                .map(id -> "?")
                .collect(Collectors.joining(","));

        String deletedCondition = hasColumn("activities", "deleted_at")
                ? " AND deleted_at IS NULL"
                : "";

        String statusCondition = hasColumn("activities", "activity_status")
                ? " AND UPPER(COALESCE(activity_status, 'ACTIVE')) = 'ACTIVE'"
                : "";

        String sql = """
                SELECT activity_id, activity_name, opening_time, closing_time,
                       recommended_duration_minutes, best_time_of_day, activity_intensity,
                       city, province
                FROM activities
                WHERE activity_id IN (%s)%s%s
                """.formatted(
                placeholders,
                deletedCondition,
                statusCondition
        );

        return jdbcTemplate.query(
                        sql,
                        (rs, rowNum) -> new ActivitySchedule(
                                rs.getInt("activity_id"),
                                rs.getString("activity_name"),
                                rs.getTime("opening_time") == null
                                        ? null
                                        : rs.getTime("opening_time").toLocalTime(),
                                rs.getTime("closing_time") == null
                                        ? null
                                        : rs.getTime("closing_time").toLocalTime(),
                                (Integer) rs.getObject("recommended_duration_minutes"),
                                rs.getString("best_time_of_day"),
                                rs.getString("activity_intensity"),
                                rs.getString("city"),
                                rs.getString("province")
                        ),
                        ids.toArray()
                ).stream()
                .collect(Collectors.toMap(
                        ActivitySchedule::activityId,
                        Function.identity()
                ));
    }

    private boolean requiresTravelBuffer(ItineraryItem item) {
        if (item == null) return false;
        return PLACE_BASED_SOURCE_TYPES.contains(
                normalizeSourceType(item.getSourceType())
        );
    }

    private boolean samePlace(ItineraryItem left, ItineraryItem right) {
        if (left == null || right == null) return false;

        if (left.getLatitude() != null
                && left.getLongitude() != null
                && right.getLatitude() != null
                && right.getLongitude() != null) {
            return left.getLatitude().compareTo(right.getLatitude()) == 0
                    && left.getLongitude().compareTo(right.getLongitude()) == 0;
        }

        String leftAddress = plainText(safeText(left.getAddress()));
        String rightAddress = plainText(safeText(right.getAddress()));

        return !leftAddress.isBlank()
                && leftAddress.equals(rightAddress);
    }

    private boolean hasColumn(String tableName, String columnName) {
        if (jdbcTemplate == null) return false;

        try {
            Boolean exists = jdbcTemplate.execute(
                    (org.springframework.jdbc.core.ConnectionCallback<Boolean>) connection -> {
                        try (var columns = connection.getMetaData().getColumns(
                                connection.getCatalog(),
                                null,
                                tableName,
                                columnName
                        )) {
                            return columns.next();
                        }
                    }
            );
            return Boolean.TRUE.equals(exists);
        } catch (Exception exception) {
            return false;
        }
    }

    private void ensureEndTimeFromOwnDuration(ItineraryItem item) {
        if (item.getStartTime() != null
                && item.getEndTime() == null
                && item.getDurationMinutes() != null
                && item.getDurationMinutes() > 0) {
            item.setEndTime(
                    item.getStartTime().plusMinutes(item.getDurationMinutes())
            );
        }
    }

    private Map<Integer, List<ItineraryItem>> groupedByDay(List<ItineraryItem> items) {
        if (items == null) return Map.of();

        return items.stream().collect(Collectors.groupingBy(
                item -> item.getDayNumber() == null ? 1 : item.getDayNumber(),
                LinkedHashMap::new,
                Collectors.toList()
        ));
    }

    private List<ItineraryItem> timedItems(List<ItineraryItem> items) {
        return items.stream()
                .filter(item -> item.getStartTime() != null && item.getEndTime() != null)
                .sorted(Comparator
                        .comparing(ItineraryItem::getStartTime)
                        .thenComparing(item -> item.getDisplayOrder() == null
                                ? Integer.MAX_VALUE
                                : item.getDisplayOrder()))
                .toList();
    }

    private boolean isSystemActivity(ItineraryItem item) {
        return "SYSTEM_ACTIVITY".equals(
                normalizeSourceType(item.getSourceType())
        );
    }

    private boolean isFixedUserCustomItem(ItineraryItem item) {
        if (item == null) return false;

        return "USER_CUSTOM".equals(
                normalizeSourceType(item.getSourceType())
        ) && Boolean.TRUE.equals(item.getFixedTime());
    }

    private String normalizeSourceType(String value) {
        String normalized = value == null
                ? ""
                : value.trim().toUpperCase(Locale.ROOT);

        return "ACTIVITY".equals(normalized)
                ? "SYSTEM_ACTIVITY"
                : normalized;
    }

    private Integer activityId(ItineraryItem item) {
        if (item == null) return null;
        if (item.getActivityId() != null) return item.getActivityId();

        Long sourceId = item.getSourceId();
        return sourceId == null ? null : sourceId.intValue();
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

    private ItineraryValidationViolation violation(
            Integer dayNumber,
            String itemTitle,
            Integer activityId,
            String generatedTime,
            LocalTime openingTime,
            LocalTime closingTime,
            String reason
    ) {
        return new ItineraryValidationViolation(
                dayNumber,
                itemTitle,
                activityId,
                generatedTime,
                openingTime,
                closingTime,
                reason
        );
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private String plainText(String value) {
        if (value == null) return "";

        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    private record TimeWindow(
            LocalTime start,
            LocalTime end,
            String reason
    ) {
    }

    public record ActivitySchedule(
            Integer activityId,
            String activityName,
            LocalTime openingTime,
            LocalTime closingTime,
            Integer recommendedDurationMinutes,
            String bestTimeOfDay,
            String activityIntensity,
            String city,
            String province
    ) {
    }

    public record ValidationResult(List<ItineraryValidationViolation> violations) {
        public boolean valid() {
            return violations == null || violations.isEmpty();
        }
    }
}
