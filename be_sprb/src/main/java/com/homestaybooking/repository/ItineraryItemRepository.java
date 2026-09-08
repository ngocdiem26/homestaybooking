package com.homestaybooking.repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.entity.ItineraryItem;
import com.homestaybooking.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ItineraryItemRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    private final RowMapper<ItineraryItem> mapper = (rs, rowNum) -> ItineraryItem.builder()
            .itemId(rs.getLong("item_id"))
            .itineraryId(rs.getLong("itinerary_id"))
            .itineraryCode(rs.getString("itinerary_code"))
            .userId(rs.getInt("user_id"))
            .itineraryTitle(rs.getString("itinerary_title"))
            .destinationKeyword(rs.getString("destination_keyword"))
            .city(rs.getString("city"))
            .province(rs.getString("province"))
            .startDate(rs.getDate("start_date") == null ? null : rs.getDate("start_date").toLocalDate())
            .endDate(rs.getDate("end_date") == null ? null : rs.getDate("end_date").toLocalDate())
            .totalDays((Integer) rs.getObject("total_days"))
            .travelerCount((Integer) rs.getObject("traveler_count"))
            .travelStyle(rs.getString("travel_style"))
            .pace(rs.getString("pace"))
            .itinerarySummary(rs.getString("itinerary_summary"))
            .dayNumber(rs.getInt("day_number"))
            .startTime(rs.getTime("start_time") == null ? null : rs.getTime("start_time").toLocalTime())
            .endTime(rs.getTime("end_time") == null ? null : rs.getTime("end_time").toLocalTime())
            .durationMinutes((Integer) rs.getObject("duration_minutes"))
            .preferredTimeOfDay(rs.getString("preferred_time_of_day"))
            .fixedTime(rs.getBoolean("fixed_time"))
            .title(rs.getString("title"))
            .address(rs.getString("address"))
            .locationName(resolveDisplayLocation(rs.getString("title"), rs.getString("address")))
            .itemType(rs.getString("item_type"))
            .sourceType(rs.getString("source_type"))
            .activityId((Integer) rs.getObject("activity_id"))
            .sourceId(readLongObject(rs.getObject("source_id")))
            .latitude(rs.getBigDecimal("latitude"))
            .longitude(rs.getBigDecimal("longitude"))
            .estimatedCost(rs.getBigDecimal("estimated_cost"))
            .transportNote(rs.getString("transport_note"))
            .note(rs.getString("note"))
            .displayOrder(rs.getInt("display_order"))
            .rawUserRequest(rs.getString("raw_user_request"))
            .rawAiResponse(rs.getString("raw_ai_response"))
            .itineraryStatus(rs.getString("itinerary_status"))
            .generationStatus(rs.getString("generation_status"))
            .createdAt(rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime())
            .updatedAt(rs.getTimestamp("updated_at") == null ? null : rs.getTimestamp("updated_at").toLocalDateTime())
            .build();

    public void saveAll(List<ItineraryItem> items) {
        saveAll(items, "SUCCESS");
    }

    public void saveAll(List<ItineraryItem> items, String generationStatus) {
        assertModernItinerarySchema();
        if (items == null || items.isEmpty()) return;

        String safeGenerationStatus =
                generationStatus == null || generationStatus.isBlank()
                        ? "SUCCESS"
                        : generationStatus.trim().toUpperCase();

        ItineraryItem first = items.get(0);
        LocalDate startDate = first.getStartDate();
        Integer totalDays = first.getTotalDays() == null || first.getTotalDays() < 1 ? 1 : first.getTotalDays();
        LocalDate endDate = startDate == null ? null : startDate.plusDays(totalDays - 1L);
        LocalDateTime createdAt = first.getCreatedAt() == null ? LocalDateTime.now() : first.getCreatedAt();

        /*
         * Một số database cũ của project không còn cột selected_home_id,
         * trong khi schema mới có cột này. Không được hard-code cột đó
         * trong INSERT vì sẽ gây:
         *
         *   Unknown column 'selected_home_id' in 'field list'
         *
         * Repository tự kiểm tra schema hiện tại để tương thích cả hai bản.
         */
        boolean hasSelectedHomeId =
                hasColumn("itineraries", "selected_home_id");

        String insertItinerarySql;

        if (hasSelectedHomeId) {
            insertItinerarySql = """
                    INSERT INTO itineraries (
                        itinerary_code, user_id, itinerary_title, destination_keyword, city, province,
                        start_date, end_date, total_days, traveler_count, travel_style, pace, interests,
                        selected_home_id, itinerary_summary, raw_user_request, raw_ai_response,
                        generation_status, itinerary_status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
                    """;
        } else {
            insertItinerarySql = """
                    INSERT INTO itineraries (
                        itinerary_code, user_id, itinerary_title, destination_keyword, city, province,
                        start_date, end_date, total_days, traveler_count, travel_style, pace, interests,
                        itinerary_summary, raw_user_request, raw_ai_response,
                        generation_status, itinerary_status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
                    """;
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps =
                    connection.prepareStatement(
                            insertItinerarySql,
                            Statement.RETURN_GENERATED_KEYS
                    );

            int index = 1;

            ps.setString(index++, first.getItineraryCode());
            ps.setInt(index++, first.getUserId());
            ps.setString(index++, first.getItineraryTitle());
            ps.setString(index++, first.getDestinationKeyword());
            ps.setString(index++, first.getCity());
            ps.setString(index++, first.getProvince());
            ps.setDate(
                    index++,
                    startDate == null
                            ? null
                            : Date.valueOf(startDate)
            );
            ps.setDate(
                    index++,
                    endDate == null
                            ? null
                            : Date.valueOf(endDate)
            );
            ps.setInt(index++, totalDays);
            ps.setObject(index++, first.getTravelerCount());
            ps.setString(index++, first.getTravelStyle());
            ps.setString(index++, first.getPace());
            ps.setString(
                    index++,
                    readInterestsJson(
                            first.getRawUserRequest()
                    )
            );

            if (hasSelectedHomeId) {
                ps.setObject(
                        index++,
                        findSelectedHomeId(items)
                );
            }

            ps.setString(
                    index++,
                    first.getItinerarySummary()
            );
            ps.setString(
                    index++,
                    first.getRawUserRequest()
            );
            ps.setString(
                    index++,
                    first.getRawAiResponse()
            );
            ps.setString(
                    index++,
                    safeGenerationStatus
            );
            ps.setTimestamp(
                    index,
                    Timestamp.valueOf(createdAt)
            );

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Không lấy được itinerary_id sau khi lưu lịch trình.");
        }
        long itineraryId = key.longValue();

        String insertItemSql = """
                INSERT INTO itinerary_items (
                    itinerary_id, day_number, start_time, end_time, duration_minutes,
                    preferred_time_of_day, fixed_time, title, address,
                    item_type, source_type, activity_id, latitude, longitude,
                    estimated_cost, transport_note, note, display_order, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        jdbcTemplate.batchUpdate(insertItemSql, items, items.size(), (ps, item) -> {
            Integer activityId = resolveActivityId(item);
            item.setItineraryId(itineraryId);
            item.setActivityId(activityId);

            ps.setLong(1, itineraryId);
            ps.setInt(2, item.getDayNumber());
            ps.setTime(3, item.getStartTime() == null ? null : Time.valueOf(item.getStartTime()));
            ps.setTime(4, item.getEndTime() == null ? null : Time.valueOf(item.getEndTime()));
            ps.setObject(5, item.getDurationMinutes());
            ps.setString(6, item.getPreferredTimeOfDay());
            ps.setBoolean(7, Boolean.TRUE.equals(item.getFixedTime()));
            ps.setString(8, item.getTitle());
            ps.setString(9, item.getAddress());
            ps.setString(10, item.getItemType());
            ps.setString(11, item.getSourceType());
            ps.setObject(12, activityId);
            ps.setBigDecimal(13, item.getLatitude());
            ps.setBigDecimal(14, item.getLongitude());
            ps.setBigDecimal(15, item.getEstimatedCost());
            ps.setString(16, item.getTransportNote());
            ps.setString(17, item.getNote());
            ps.setInt(18, item.getDisplayOrder());
            ps.setTimestamp(19, Timestamp.valueOf(item.getCreatedAt() == null ? createdAt : item.getCreatedAt()));
        });
    }

    public List<ItineraryItem> findSummariesByUserId(Integer userId) {
        return jdbcTemplate.query(baseSelect() + """
                JOIN (
                    SELECT itinerary_id, MIN(item_id) AS first_item_id
                    FROM itinerary_items
                    GROUP BY itinerary_id
                ) first_rows ON first_rows.first_item_id = i.item_id
                WHERE t.user_id = ? AND t.itinerary_status = 'ACTIVE'
                ORDER BY t.created_at DESC, t.itinerary_id DESC
                """, mapper, userId);
    }

    public List<ItineraryItem> findActiveByCodeForUser(String itineraryCode, Integer userId) {
        return jdbcTemplate.query(baseSelect() + """
                WHERE t.itinerary_code = ? AND t.user_id = ? AND t.itinerary_status = 'ACTIVE'
                ORDER BY i.day_number ASC, i.display_order ASC, i.start_time ASC, i.item_id ASC
                """, mapper, itineraryCode, userId);
    }

    public int countItems(String itineraryCode, Integer userId) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM itinerary_items i
                JOIN itineraries t ON t.itinerary_id = i.itinerary_id
                WHERE t.itinerary_code = ? AND t.user_id = ? AND t.itinerary_status = 'ACTIVE'
                """, Integer.class, itineraryCode, userId);
        return count == null ? 0 : count;
    }

    public void softDelete(String itineraryCode, Integer userId) {
        jdbcTemplate.update("""
                UPDATE itineraries
                SET itinerary_status = 'DELETED', updated_at = NOW()
                WHERE itinerary_code = ? AND user_id = ? AND itinerary_status = 'ACTIVE'
                """, itineraryCode, userId);
    }

    private String baseSelect() {
        return """
                SELECT
                    i.item_id,
                    i.itinerary_id,
                    t.itinerary_code,
                    t.user_id,
                    t.itinerary_title,
                    t.destination_keyword,
                    t.city,
                    t.province,
                    t.start_date,
                    t.end_date,
                    t.total_days,
                    t.traveler_count,
                    t.travel_style,
                    t.pace,
                    t.itinerary_summary,
                    t.raw_user_request,
                    t.raw_ai_response,
                    t.generation_status,
                    t.itinerary_status,
                    t.created_at,
                    t.updated_at,
                    i.day_number,
                    i.start_time,
                    i.end_time,
                    i.duration_minutes,
                    i.preferred_time_of_day,
                    i.fixed_time,
                    i.title,
                    i.address,
                    i.item_type,
                    i.source_type,
                    i.activity_id,
                    CASE
                        WHEN i.source_type IN ('ACTIVITY', 'SYSTEM_ACTIVITY') THEN CAST(i.activity_id AS SIGNED)
                        ELSE NULL
                    END AS source_id,
                    i.latitude,
                    i.longitude,
                    i.estimated_cost,
                    i.transport_note,
                    i.note,
                    i.display_order
                FROM itinerary_items i
                JOIN itineraries t ON t.itinerary_id = i.itinerary_id
                """;
    }


    public void replaceItems(
            String itineraryCode,
            Integer userId,
            String itineraryTitle,
            String summary,
            List<ItineraryItem> items
    ) {
        replaceItems(
                itineraryCode,
                userId,
                itineraryTitle,
                summary,
                items,
                "SUCCESS"
        );
    }

    public void replaceItems(
            String itineraryCode,
            Integer userId,
            String itineraryTitle,
            String summary,
            List<ItineraryItem> items,
            String generationStatus
    ) {
        assertModernItinerarySchema();

        String safeGenerationStatus =
                generationStatus == null || generationStatus.isBlank()
                        ? "SUCCESS"
                        : generationStatus.trim().toUpperCase();
        Long itineraryId = jdbcTemplate.query(baseSelect() + """
                WHERE t.itinerary_code = ? AND t.user_id = ? AND t.itinerary_status = 'ACTIVE'
                LIMIT 1
                """, mapper, itineraryCode, userId).stream()
                .map(ItineraryItem::getItineraryId)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Khong tim thay lich trinh de cap nhat."));

        jdbcTemplate.update("""
                UPDATE itineraries
                SET itinerary_title = ?,
                    itinerary_summary = ?,
                    generation_status = ?,
                    updated_at = NOW()
                WHERE itinerary_id = ? AND user_id = ? AND itinerary_status = 'ACTIVE'
                """, itineraryTitle, summary, safeGenerationStatus, itineraryId, userId);
        jdbcTemplate.update("DELETE FROM itinerary_items WHERE itinerary_id = ?", itineraryId);

        String insertItemSql = """
                INSERT INTO itinerary_items (
                    itinerary_id, day_number, start_time, end_time, duration_minutes,
                    preferred_time_of_day, fixed_time, title, address,
                    item_type, source_type, activity_id, latitude, longitude,
                    estimated_cost, transport_note, note, display_order, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        LocalDateTime createdAt = LocalDateTime.now();
        jdbcTemplate.batchUpdate(insertItemSql, items, items.size(), (ps, item) -> {
            Integer activityId = resolveActivityId(item);
            item.setItineraryId(itineraryId);
            item.setActivityId(activityId);

            ps.setLong(1, itineraryId);
            ps.setInt(2, item.getDayNumber());
            ps.setTime(3, item.getStartTime() == null ? null : Time.valueOf(item.getStartTime()));
            ps.setTime(4, item.getEndTime() == null ? null : Time.valueOf(item.getEndTime()));
            ps.setObject(5, item.getDurationMinutes());
            ps.setString(6, item.getPreferredTimeOfDay());
            ps.setBoolean(7, Boolean.TRUE.equals(item.getFixedTime()));
            ps.setString(8, item.getTitle());
            ps.setString(9, item.getAddress());
            ps.setString(10, item.getItemType());
            ps.setString(11, item.getSourceType());
            ps.setObject(12, activityId);
            ps.setBigDecimal(13, item.getLatitude());
            ps.setBigDecimal(14, item.getLongitude());
            ps.setBigDecimal(15, item.getEstimatedCost());
            ps.setString(16, item.getTransportNote());
            ps.setString(17, item.getNote());
            ps.setInt(18, item.getDisplayOrder());
            ps.setTimestamp(19, Timestamp.valueOf(createdAt));
        });
    }
    private String resolveDisplayLocation(String title, String address) {
        if (address != null && !address.isBlank()) return address;
        return title;
    }

    private Long readLongObject(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception exception) {
            return null;
        }
    }

    private void assertModernItinerarySchema() {
        List<String> missing = new ArrayList<>();
        requireTable(missing, "itineraries");
        requireTable(missing, "itinerary_items");

        requireColumn(missing, "itineraries", "itinerary_id");
        requireColumn(missing, "itineraries", "itinerary_code");
        requireColumn(missing, "itineraries", "user_id");
        requireColumn(missing, "itineraries", "itinerary_title");
        requireColumn(missing, "itineraries", "itinerary_summary");
        requireColumn(missing, "itineraries", "raw_user_request");
        requireColumn(missing, "itineraries", "raw_ai_response");
        requireColumn(missing, "itineraries", "generation_status");
        requireColumn(missing, "itineraries", "itinerary_status");

        requireColumn(missing, "itinerary_items", "item_id");
        requireColumn(missing, "itinerary_items", "itinerary_id");
        requireColumn(missing, "itinerary_items", "day_number");
        requireColumn(missing, "itinerary_items", "title");
        requireColumn(missing, "itinerary_items", "item_type");
        requireColumn(missing, "itinerary_items", "source_type");
        requireColumn(missing, "itinerary_items", "activity_id");
        requireColumn(missing, "itinerary_items", "display_order");

        if (!missing.isEmpty()) {
            throw new AppException("Schema lịch trình chưa đúng dữ liệu mới. Thiếu: " + String.join(", ", missing) + ". Vui lòng chạy migration tạo lại bảng itineraries và itinerary_items mới.");
        }
    }

    private void requireTable(List<String> missing, String table) {
        if (!tableExists(table)) missing.add(table + " table");
    }

    private void requireColumn(List<String> missing, String table, String column) {
        if (tableExists(table) && !hasColumn(table, column)) missing.add(table + "." + column);
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                """, Integer.class, table);
        return count != null && count > 0;
    }

    private boolean hasColumn(String table, String column) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*) FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
                """, Integer.class, table, column);
        return count != null && count > 0;
    }
    private String readInterestsJson(String rawUserRequest) {
        if (rawUserRequest == null || rawUserRequest.isBlank()) return null;
        try {
            JsonNode interests = objectMapper.readTree(rawUserRequest).path("interests");
            if (interests.isMissingNode() || interests.isNull()) return null;
            return objectMapper.writeValueAsString(interests);
        } catch (Exception exception) {
            return null;
        }
    }

    private Integer findSelectedHomeId(List<ItineraryItem> items) {
        return items.stream()
                .map(this::resolveHomestayId)
                .filter(id -> id != null && id > 0)
                .findFirst()
                .orElse(null);
    }

    private Integer resolveActivityId(ItineraryItem item) {
        if (item.getActivityId() != null) return item.getActivityId();
        String sourceType = String.valueOf(item.getSourceType());
        if (!"ACTIVITY".equalsIgnoreCase(sourceType) && !"SYSTEM_ACTIVITY".equalsIgnoreCase(sourceType)) return null;
        Long sourceId = item.getSourceId();
        return sourceId == null ? null : sourceId.intValue();
    }

    private Integer resolveHomestayId(ItineraryItem item) {
        if (item.getHomestayId() != null) return item.getHomestayId();
        if (!"HOMESTAY".equalsIgnoreCase(String.valueOf(item.getSourceType()))) return null;
        Long sourceId = item.getSourceId();
        return sourceId == null ? null : sourceId.intValue();
    }
}
