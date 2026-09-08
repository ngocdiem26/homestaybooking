package com.homestaybooking.service;

import com.homestaybooking.dto.response.ActivitySuggestionResponse;
import com.homestaybooking.service.DestinationResolver.ResolvedDestination;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ItineraryActivitySuggestionService {

    private final JdbcTemplate jdbcTemplate;
    private final DestinationResolver destinationResolver;
    private final Map<String, Boolean> columnCache = new HashMap<>();

    /*
     * Không ALTER/UPDATE schema trong @PostConstruct.
     * Schema và dữ liệu mẫu phải được quản lý bằng migration SQL.
     * Service chỉ đọc dữ liệu và vẫn hỗ trợ fallback city -> district nếu DB cũ chưa có city.
     */

    public List<ActivitySuggestionResponse> suggest(String destination, String city, String province, String style, List<String> interests, Integer limit) {
        int safeLimit = limit == null ? 12 : Math.max(1, Math.min(limit, 30));
        ResolvedDestination resolvedDestination = destinationResolver.resolve(destination, city, province);
        String styleKey = normalize(style);
        List<String> interestKeys = normalizeList(interests);

        List<ActivitySuggestionResponse> candidates = loadActiveActivities();
        if (resolvedDestination.hasDestination()) {
            candidates = candidates.stream()
                    .filter(item -> matchesDestination(item, resolvedDestination))
                    .toList();
        }

        return candidates.stream()
                .map(item -> {
                    item.setMatchScore(score(item, resolvedDestination, styleKey, interestKeys));
                    return item;
                })
                .sorted(Comparator.comparing(ActivitySuggestionResponse::getMatchScore, Comparator.nullsLast(Integer::compareTo)).reversed()
                        .thenComparing(ActivitySuggestionResponse::getActivityId, Comparator.nullsLast(Integer::compareTo)))
                .limit(safeLimit)
                .toList();
    }

    public List<ActivitySuggestionResponse> findByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return loadActiveActivities().stream()
                .filter(item -> ids.contains(item.getActivityId()))
                .toList();
    }

    public boolean matchesDestination(ActivitySuggestionResponse item, ResolvedDestination destination) {
        if (item == null || destination == null || !destination.hasDestination()) return true;
        String city = normalize(item.getCity());
        String province = normalize(item.getProvince());
        String address = normalize(item.getAddress());
        String destinationCity = normalize(destination.city());
        String destinationProvince = normalize(destination.province());

        boolean cityMatch = !destinationCity.isBlank()
                && (city.equals(destinationCity) || city.contains(destinationCity) || address.contains(destinationCity));
        boolean provinceMatch = !destinationProvince.isBlank()
                && (province.equals(destinationProvince) || province.contains(destinationProvince) || address.contains(destinationProvince));

        if (!destinationCity.isBlank()) return cityMatch;
        return provinceMatch;
    }

    private List<ActivitySuggestionResponse> loadActiveActivities() {
        String cityExpression = hasColumn("activities", "city") ? "a.city" : (hasColumn("activities", "district") ? "a.district" : "NULL");
        String addressExpression = hasColumn("activities", "activity_address") ? "a.activity_address" : (hasColumn("activities", "address") ? "a.address" : "NULL");
        String deletedCondition = hasColumn("activities", "deleted_at") ? "a.deleted_at IS NULL AND" : "";
        String statusCondition = hasColumn("activities", "activity_status") ? "UPPER(COALESCE(a.activity_status, 'ACTIVE')) = 'ACTIVE'" : "1 = 1";
        String sql = """
                SELECT
                    a.activity_id,
                    a.activity_name,
                    a.province,
                    %s AS city,
                    %s AS activity_address,
                    a.latitude,
                    a.longitude,
                    %s AS short_description,
                    %s AS description,
                    %s AS thumbnail_url,
                    %s AS hotline,
                    %s AS activity_tags,
                    %s AS suitable_travel_styles,
                    %s AS opening_time,
                    %s AS closing_time,
                    %s AS recommended_duration_minutes,
                    %s AS best_time_of_day,
                    %s AS activity_intensity,
                    %s AS estimated_cost_min,
                    %s AS estimated_cost_max
                FROM activities a
                WHERE %s %s
                ORDER BY %s a.activity_id ASC
                LIMIT 200
                """.formatted(
                cityExpression,
                addressExpression,
                columnOrNull("activities", "short_description", "a.short_description"),
                columnOrNull("activities", "description", "a.description"),
                columnOrNull("activities", "thumbnail_url", "a.thumbnail_url"),
                columnOrNull("activities", "hotline", "a.hotline"),
                columnOrNull("activities", "activity_tags", "a.activity_tags"),
                columnOrNull("activities", "suitable_travel_styles", "a.suitable_travel_styles"),
                columnOrNull("activities", "opening_time", "a.opening_time"),
                columnOrNull("activities", "closing_time", "a.closing_time"),
                columnOrNull("activities", "recommended_duration_minutes", "a.recommended_duration_minutes"),
                columnOrNull("activities", "best_time_of_day", "a.best_time_of_day"),
                columnOrNull("activities", "activity_intensity", "a.activity_intensity"),
                columnOrNull("activities", "estimated_cost_min", "a.estimated_cost_min"),
                columnOrNull("activities", "estimated_cost_max", "a.estimated_cost_max"),
                deletedCondition,
                statusCondition,
                hasColumn("activities", "display_order") ? "a.display_order ASC," : ""
        );

        return jdbcTemplate.query(sql, (rs, rowNum) -> ActivitySuggestionResponse.builder()
                .activityId(rs.getInt("activity_id"))
                .activityName(rs.getString("activity_name"))
                .province(rs.getString("province"))
                .city(rs.getString("city"))
                .address(rs.getString("activity_address"))
                .latitude(rs.getBigDecimal("latitude"))
                .longitude(rs.getBigDecimal("longitude"))
                .shortDescription(rs.getString("short_description"))
                .description(rs.getString("description"))
                .thumbnailUrl(rs.getString("thumbnail_url"))
                .hotline(rs.getString("hotline"))
                .tags(rs.getString("activity_tags"))
                .suitableTravelStyles(rs.getString("suitable_travel_styles"))
                .openingTime(rs.getTime("opening_time") == null ? null : rs.getTime("opening_time").toLocalTime())
                .closingTime(rs.getTime("closing_time") == null ? null : rs.getTime("closing_time").toLocalTime())
                .recommendedDurationMinutes((Integer) rs.getObject("recommended_duration_minutes"))
                .bestTimeOfDay(rs.getString("best_time_of_day"))
                .activityIntensity(rs.getString("activity_intensity"))
                .intensity(rs.getString("activity_intensity"))
                .estimatedCostMin(rs.getBigDecimal("estimated_cost_min"))
                .estimatedCostMax(rs.getBigDecimal("estimated_cost_max"))
                .build());
    }

    private int score(ActivitySuggestionResponse item, ResolvedDestination destination, String style, List<String> interests) {
        String haystack = normalize(String.join(" ",
                safe(item.getActivityName()), safe(item.getProvince()), safe(item.getCity()), safe(item.getAddress()),
                safe(item.getShortDescription()), safe(item.getDescription()), safe(item.getTags()), safe(item.getSuitableTravelStyles())
        ));
        int score = 0;
        if (destination != null && destination.hasDestination()) {
            if (!normalize(destination.city()).isBlank() && contains(haystack, normalize(destination.city()))) score += 70;
            if (!normalize(destination.province()).isBlank() && contains(haystack, normalize(destination.province()))) score += 45;
        }
        if (!style.isBlank() && contains(haystack, style)) score += 20;
        for (String interest : interests) {
            if (!interest.isBlank() && contains(haystack, interest)) score += 18;
        }
        return score;
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                """, Integer.class, table);
        return count != null && count > 0;
    }

    private boolean hasColumnDirect(String table, String column) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
                """, Integer.class, table, column);
        return count != null && count > 0;
    }

    private boolean hasColumn(String table, String column) {
        String key = table + "." + column;
        if (columnCache.containsKey(key)) return columnCache.get(key);
        boolean exists = hasColumnDirect(table, column);
        columnCache.put(key, exists);
        return exists;
    }

    private String columnOrNull(String table, String column, String expression) {
        return hasColumn(table, column) ? expression : "NULL";
    }

    private String normalize(String value) {
        return destinationResolver.normalize(value);
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null) return List.of();
        return values.stream().filter(Objects::nonNull).map(this::normalize).filter(value -> !value.isBlank()).toList();
    }

    private boolean contains(String haystack, String needle) {
        return !haystack.isBlank() && !needle.isBlank() && haystack.contains(needle);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
