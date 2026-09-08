package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import com.homestaybooking.dto.response.chatbot.ChatbotRetrievalResult;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatbotDataRetrievalService {

    private static final int DEFAULT_LIMIT = 8;

    private final JdbcTemplate jdbcTemplate;
    private final ChatbotRagService ragService;
    private final ObjectMapper objectMapper;

    public ChatbotRetrievalResult retrieve(ChatbotIntentAnalysis analysis, String userMessage, Integer userId) {
        String intent = analysis == null ? "UNKNOWN" : analysis.getPrimaryIntent();
        ChatbotIntentAnalysis.Entities filters = analysis == null ? new ChatbotIntentAnalysis.Entities() : analysis.getEntities();

        return switch (intent) {
            case "GREETING" -> text("Chào bạn, mình là trợ lý Cozygo. Mình có thể giúp bạn tìm homestay, hoạt động, khuyến mãi và hướng dẫn đặt phòng.", defaultSuggestions());
            case "PROMOTION_LOOKUP", "BEST_DEAL_LOOKUP" -> promotionLookup(filters, userId);
            case "DESTINATION_SUGGESTION" -> destinationLookup(filters, userMessage);
            case "ACTIVITY_SUGGESTION", "NEARBY_ACTIVITY_LOOKUP" -> activityLookup(filters, userMessage);
            case "SEARCH_HOMESTAY_NEAR_ACTIVITY" -> homestayNearActivity(filters);
            case "TRIP_PLANNING", "ITINERARY_GENERATION" -> itineraryFeatureHandoff();
            case "SEARCH_HOMESTAY", "SEARCH_HOMESTAY_BY_DESTINATION", "SEARCH_HOMESTAY_BY_PRICE", "SEARCH_HOMESTAY_BY_AMENITY", "SEARCH_HOMESTAY_BY_CAPACITY" -> homestayLookup(filters);
            case "BOOKING_STATUS", "USER_BOOKING_HISTORY_LOOKUP", "USER_FAVORITES_LOOKUP", "USER_TIER_LOOKUP" -> userPrivateLookup(intent, userId);
            case "BOOKING_GUIDE" -> guide(
                    "BOOKING_GUIDE",
                    userMessage,
                    "Hướng dẫn đặt phòng Cozygo",
                    List.of(),
                    "BOOKING_GUIDE",
                    "BOOKING_POLICY"
            );
            case "PAYMENT_GUIDE", "VNPAY_GUIDE", "PAY_AT_PROPERTY_GUIDE" -> guide(
                    "PAYMENT_GUIDE",
                    userMessage,
                    "Hướng dẫn thanh toán Cozygo",
                    List.of(),
                    "PAYMENT_GUIDE"
            );
            case "COMPLAINT_GUIDE" -> guide(
                    "COMPLAINT_GUIDE",
                    userMessage,
                    "Hướng dẫn khiếu nại Cozygo",
                    List.of(),
                    "COMPLAINT_GUIDE"
            );
            case "REFUND_OR_CANCEL_GUIDE" -> guide(
                    "CANCELLATION_GUIDE",
                    userMessage,
                    "Chính sách hủy và hoàn tiền Cozygo",
                    List.of(),
                    "CANCELLATION_POLICY"
            );
            case "POLICY_QA", "FAQ_QA" -> guide(
                    "RAG_GUIDE",
                    userMessage,
                    "Thông tin hỗ trợ Cozygo",
                    List.of()
            );
            case "OUT_OF_SCOPE" -> text("Mình chỉ hỗ trợ các câu hỏi liên quan đến Cozygo như homestay, hoạt động, đặt phòng, thanh toán, khuyến mãi và khiếu nại.", List.of());
            default -> guide(
                    "RAG_GUIDE",
                    userMessage,
                    "Thông tin hỗ trợ Cozygo",
                    List.of()
            );
        };
    }

    private ChatbotRetrievalResult homestayLookup(ChatbotIntentAnalysis.Entities filters) {
        List<Map<String, Object>> homestays = searchHomestays(filters, DEFAULT_LIMIT);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("homestays", homestays);
        if (Boolean.TRUE.equals(filters.getNeedNearbyActivities())) {
            data.put("activities", searchActivities(filters, filters.getActivityKeyword(), 5));
        }
        data.put("filters", filters);
        if (filters.getCheckIn() == null || filters.getCheckOut() == null) {
            data.put("availabilityNote", "Chưa có ngày nhận/trả phòng nên hệ thống chưa kiểm tra lịch trống.");
        }
        return new ChatbotRetrievalResult("HOMESTAY_LIST", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult homestayNearActivity(ChatbotIntentAnalysis.Entities filters) {
        List<Map<String, Object>> activities = searchActivities(filters, filters.getActivityKeyword(), 3);
        if (activities.isEmpty()) {
            Map<String, Object> data = Map.of("activities", List.of(), "homestays", List.of(), "message", "Không tìm thấy hoạt động phù hợp để tính khoảng cách.");
            return new ChatbotRetrievalResult("HOMESTAY_LIST", data, toJson(data), List.of());
        }

        Map<String, Object> activity = firstActivityWithCoordinate(activities);
        List<Map<String, Object>> homestays;
        if (activity == null) {
            homestays = searchHomestays(filters, DEFAULT_LIMIT);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("activities", activities);
            data.put("homestays", homestays);
            data.put("filters", filters);
            data.put("message", "Hoạt động phù hợp chưa có tọa độ nên hệ thống tạm gợi ý homestay theo khu vực và điều kiện bạn đưa ra.");
            return new ChatbotRetrievalResult("HOMESTAY_LIST", data, toJson(data), List.of());
        }

        BigDecimal lat = asBigDecimal(activity.get("latitude"));
        BigDecimal lng = asBigDecimal(activity.get("longitude"));
        homestays = searchHomestaysNear(filters, lat, lng, DEFAULT_LIMIT);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activity", activity);
        data.put("activities", activities);
        data.put("homestays", homestays);
        data.put("filters", filters);
        return new ChatbotRetrievalResult("HOMESTAY_LIST", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult itineraryFeatureHandoff() {
        String message =
                "Cozygo có chức năng Tạo lịch trình AI riêng để tạo, kiểm tra và lưu lịch trình. "
                        + "Chatbot không tự dựng lịch trình mẫu để tránh tạo dữ liệu giả hoặc giờ đi cố định.";

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("message", message);
        data.put("feature", "AI_ITINERARY");

        return new ChatbotRetrievalResult(
                "TEXT",
                data,
                message,
                List.of()
        );
    }

    private ChatbotRetrievalResult activityLookup(ChatbotIntentAnalysis.Entities filters, String userMessage) {
        List<Map<String, Object>> activities = searchActivities(filters, filters.getActivityKeyword(), DEFAULT_LIMIT);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activities", activities);
        data.put("filters", filters);
        return new ChatbotRetrievalResult("ACTIVITY_LIST", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult destinationLookup(ChatbotIntentAnalysis.Entities filters, String userMessage) {
        List<Map<String, Object>> destinations = searchDestinations(firstNonBlank(filters.getDestinationKeyword(), filters.getCity(), filters.getProvince(), userMessage));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("destinations", destinations);
        return new ChatbotRetrievalResult("DESTINATION_LIST", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult promotionLookup(ChatbotIntentAnalysis.Entities filters, Integer userId) {
        List<Map<String, Object>> promotions = searchPromotions(filters.getPromotionCode(), userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("promotions", promotions);
        data.put("promotionCode", filters.getPromotionCode());
        return new ChatbotRetrievalResult("PROMOTION_LIST", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult userPrivateLookup(String intent, Integer userId) {
        if (userId == null) {
            Map<String, Object> data = Map.of("reason", "LOGIN_REQUIRED", "targetIntent", intent);
            return new ChatbotRetrievalResult("LOGIN_REQUIRED", data, toJson(data), List.of());
        }
        List<Map<String, Object>> bookings = getUserBookingHistory(userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bookings", bookings);
        return new ChatbotRetrievalResult("BOOKING_STATUS", data, toJson(data), List.of());
    }

    private ChatbotRetrievalResult guide(
            String dataType,
            String query,
            String title,
            List<String> suggestions,
            String... preferredDocumentTypes
    ) {
        String context = ragService.retrieveContext(query, preferredDocumentTypes);

        boolean foundKnowledge = context != null && !context.isBlank();

        if (!foundKnowledge) {
            context =
                    "Hiện kho tri thức Cozygo chưa có tài liệu đủ phù hợp để trả lời câu hỏi này. "
                            + "Chatbot sẽ không tự tạo chính sách hoặc quy trình thay cho dữ liệu hệ thống.";
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("title", title);
        data.put("context", context);
        data.put("knowledgeFound", foundKnowledge);
        data.put("preferredDocumentTypes", preferredDocumentTypes == null
                ? List.of()
                : List.of(preferredDocumentTypes));

        return new ChatbotRetrievalResult(
                dataType,
                data,
                context,
                suggestions
        );
    }

    private ChatbotRetrievalResult text(String message, List<String> suggestions) {
        Map<String, Object> data = Map.of("message", message);
        return new ChatbotRetrievalResult("TEXT", data, message, suggestions);
    }

    public List<Map<String, Object>> searchHomestays(ChatbotIntentAnalysis.Entities filters, int limit) {
        StringBuilder sql = new StringBuilder("""
                select
                    h.home_id as homeId,
                    h.home_name as homeName,
                    h.city as city,
                    h.province as province,
                    h.home_address as address,
                    h.home_description as description,
                    h.price_per_night as pricePerNight,
                    h.max_guest as maxGuest,
                    h.rating_avg as ratingAvg,
                    h.rating_count as ratingCount,
                    h.bedroom_count as bedroomCount,
                    h.bathroom_count as bathroomCount,
                    h.kitchen_count as kitchenCount,
                    h.living_room_count as livingRoomCount,
                    h.bed_count as bedCount,
                    h.latitude as latitude,
                    h.longitude as longitude,
                    coalesce((select hi.image_url from homestay_images hi where hi.home_id = h.home_id order by hi.is_main desc, hi.sort_order asc, hi.image_id asc limit 1), '/images/destinations/dalat.jpg') as thumbnailUrl,
                    group_concat(distinct a.amenity_name separator ', ') as amenityText
                from homestays h
                left join homestay_amenities ha on ha.home_id = h.home_id
                left join amenities a on a.amenity_id = ha.amenity_id
                where h.deleted_at is null
                  and upper(coalesce(h.status, '')) in ('APPROVED', 'ACTIVE', 'VISIBLE')
                """);
        List<Object> params = new ArrayList<>();
        appendCommonFilters(sql, params, filters);
        sql.append("""
                group by h.home_id, h.home_name, h.city, h.province, h.home_address, h.home_description, h.price_per_night,
                         h.max_guest, h.rating_avg, h.rating_count, h.bedroom_count, h.bathroom_count, h.kitchen_count,
                         h.living_room_count, h.bed_count, h.latitude, h.longitude
                """);
        sql.append(orderClause(filters));
        sql.append(" limit ?");
        params.add(Math.max(1, Math.min(limit, 20)));
        return mapHomestayRows(jdbcTemplate.queryForList(sql.toString(), params.toArray()));
    }

    private List<Map<String, Object>> searchHomestaysNear(ChatbotIntentAnalysis.Entities filters, BigDecimal lat, BigDecimal lng, int limit) {
        StringBuilder sql = new StringBuilder("""
                select
                    h.home_id as homeId,
                    h.home_name as homeName,
                    h.city as city,
                    h.province as province,
                    h.home_address as address,
                    h.home_description as description,
                    h.price_per_night as pricePerNight,
                    h.max_guest as maxGuest,
                    h.rating_avg as ratingAvg,
                    h.rating_count as ratingCount,
                    h.bedroom_count as bedroomCount,
                    h.bathroom_count as bathroomCount,
                    h.kitchen_count as kitchenCount,
                    h.living_room_count as livingRoomCount,
                    h.bed_count as bedCount,
                    h.latitude as latitude,
                    h.longitude as longitude,
                    (6371 * acos(least(1, greatest(-1,
                        cos(radians(?)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(?)) +
                        sin(radians(?)) * sin(radians(h.latitude))
                    )))) as distanceKm,
                    coalesce((select hi.image_url from homestay_images hi where hi.home_id = h.home_id order by hi.is_main desc, hi.sort_order asc, hi.image_id asc limit 1), '/images/destinations/dalat.jpg') as thumbnailUrl,
                    group_concat(distinct a.amenity_name separator ', ') as amenityText
                from homestays h
                left join homestay_amenities ha on ha.home_id = h.home_id
                left join amenities a on a.amenity_id = ha.amenity_id
                where h.deleted_at is null
                  and h.latitude is not null and h.longitude is not null
                  and upper(coalesce(h.status, '')) in ('APPROVED', 'ACTIVE', 'VISIBLE')
                """);
        List<Object> params = new ArrayList<>();
        params.add(lat);
        params.add(lng);
        params.add(lat);
        appendCommonFilters(sql, params, filters);
        sql.append("""
                group by h.home_id, h.home_name, h.city, h.province, h.home_address, h.home_description, h.price_per_night,
                         h.max_guest, h.rating_avg, h.rating_count, h.bedroom_count, h.bathroom_count, h.kitchen_count,
                         h.living_room_count, h.bed_count, h.latitude, h.longitude
                order by distanceKm asc, h.rating_avg desc
                limit ?
                """);
        params.add(Math.max(1, Math.min(limit, 20)));
        return mapHomestayRows(jdbcTemplate.queryForList(sql.toString(), params.toArray()));
    }

    private void appendCommonFilters(StringBuilder sql, List<Object> params, ChatbotIntentAnalysis.Entities filters) {
        String destination = firstNonBlank(filters.getCity(), filters.getProvince(), filters.getDestinationKeyword());
        if (destination != null) {
            String like = like(destination);
            sql.append(" and (lower(coalesce(h.city, '')) like ? or lower(coalesce(h.province, '')) like ? or lower(coalesce(h.home_address, '')) like ? or lower(coalesce(h.home_name, '')) like ?) ");
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }
        if (filters.getMinPrice() != null) {
            sql.append(" and h.price_per_night >= ? ");
            params.add(filters.getMinPrice());
        }
        if (filters.getMaxPrice() != null) {
            sql.append(" and h.price_per_night <= ? ");
            params.add(filters.getMaxPrice());
        }
        if (filters.getGuests() != null) {
            sql.append(" and h.max_guest >= ? ");
            params.add(filters.getGuests());
        }
        for (String amenity : filters.getAmenities()) {
            sql.append(" and exists (select 1 from homestay_amenities ha2 join amenities a2 on a2.amenity_id = ha2.amenity_id where ha2.home_id = h.home_id and lower(a2.amenity_name) like ?) ");
            params.add(like(amenity));
        }
        for (String service : filters.getServices()) {
            sql.append(" and exists (select 1 from homestay_services hs2 join services s2 on s2.service_id = hs2.service_id where hs2.home_id = h.home_id and lower(s2.service_name) like ? and upper(coalesce(hs2.status, 'ACTIVE')) = 'ACTIVE') ");
            params.add(like(service));
        }
    }

    private String orderClause(ChatbotIntentAnalysis.Entities filters) {
        String sort = filters.getSortBy() == null ? "RELEVANCE" : filters.getSortBy().toUpperCase(Locale.ROOT);
        return switch (sort) {
            case "PRICE_ASC" -> " order by h.price_per_night asc, h.rating_avg desc ";
            case "PRICE_DESC" -> " order by h.price_per_night desc, h.rating_avg desc ";
            case "RATING_DESC" -> " order by h.rating_avg desc, h.rating_count desc ";
            case "POPULARITY_DESC" -> " order by h.rating_count desc, h.rating_avg desc ";
            default -> " order by h.rating_avg desc, h.rating_count desc, h.price_per_night asc ";
        };
    }

    private List<Map<String, Object>> searchActivities(ChatbotIntentAnalysis.Entities filters, String keyword, int limit) {
        StringBuilder sql = new StringBuilder("""
                select activity_id as activityId, activity_name as activityName, province, city,
                       activity_address as activityAddress, latitude, longitude, short_description as shortDescription,
                       thumbnail_url as thumbnailUrl, badge_text as badgeText, badge_type as badgeType
                from activities
                where deleted_at is null and upper(coalesce(activity_status, 'ACTIVE')) = 'ACTIVE'
                """);
        List<Object> params = new ArrayList<>();
        String destination = firstNonBlank(filters.getCity(), filters.getProvince(), filters.getDestinationKeyword());
        if (destination != null) {
            String like = like(destination);
            sql.append(" and (lower(coalesce(province, '')) like ? or lower(coalesce(city, '')) like ? or lower(coalesce(activity_address, '')) like ?) ");
            params.add(like);
            params.add(like);
            params.add(like);
        }
        if (keyword != null && !keyword.isBlank()) {
            String like = like(keyword);
            sql.append(" and (lower(coalesce(activity_name, '')) like ? or lower(coalesce(short_description, '')) like ? or lower(coalesce(activity_address, '')) like ?) ");
            params.add(like);
            params.add(like);
            params.add(like);
        }
        sql.append(" order by is_featured desc, display_order asc, activity_id desc limit ?");
        params.add(Math.max(1, Math.min(limit, 20)));
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    private List<Map<String, Object>> searchDestinations(String keyword) {
        StringBuilder sql = new StringBuilder("""
                select destination_id as destinationId, province_name as provinceName, city, display_name as displayName,
                       slug, description, thumbnail_url as thumbnailUrl, display_order as displayOrder
                from destinations
                where deleted_at is null and upper(coalesce(destination_status, 'ACTIVE')) = 'ACTIVE'
                """);
        List<Object> params = new ArrayList<>();
        if (keyword != null && !keyword.isBlank()) {
            String like = like(keyword);
            sql.append(" and (lower(coalesce(province_name, '')) like ? or lower(coalesce(city, '')) like ? or lower(coalesce(display_name, '')) like ? or lower(coalesce(description, '')) like ?) ");
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }
        sql.append(" order by display_order asc, destination_id asc limit 10");
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    private List<Map<String, Object>> searchPromotions(String code, Integer userId) {
        StringBuilder sql = new StringBuilder("""
                select promotion_id as promotionId, promotion_code as promotionCode, promotion_name as promotionName,
                       description, discount_type as discountType, discount_value as discountValue,
                       min_order_value as minOrderValue, start_date as startDate, end_date as endDate,
                       max_usage as maxUsage, used_count as usedCount, promotion_status as promotionStatus
                from promotions
                where upper(coalesce(promotion_status, 'ACTIVE')) = 'ACTIVE'
                  and (start_date is null or start_date <= current_date())
                  and (end_date is null or end_date >= current_date())
                """);
        List<Object> params = new ArrayList<>();
        if (code != null && !code.isBlank()) {
            sql.append(" and upper(promotion_code) = upper(?) ");
            params.add(code.trim());
        }
        sql.append(" order by discount_value desc, end_date asc limit 8");
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    private List<Map<String, Object>> getUserBookingHistory(Integer userId) {
        return jdbcTemplate.queryForList("""
                select b.booking_id as bookingId, b.booking_code as bookingCode, b.booking_status as bookingStatus,
                       b.payment_status as paymentStatus, b.total_price as totalPrice, b.created_at as createdAt,
                       h.home_name as homeName, h.city, h.province
                from bookings b
                join homestays h on h.home_id = b.home_id
                where b.user_id = ?
                order by b.created_at desc
                limit 8
                """, userId);
    }

    private Map<String, Object> firstActivityWithCoordinate(List<Map<String, Object>> activities) {
        for (Map<String, Object> activity : activities) {
            if (asBigDecimal(activity.get("latitude")) != null && asBigDecimal(activity.get("longitude")) != null) return activity;
        }
        return null;
    }

    private List<Map<String, Object>> mapHomestayRows(List<Map<String, Object>> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Map<String, Object> item = new LinkedHashMap<>(row);
            Object amenityText = row.get("amenityText");
            item.put("amenities", splitCsv(amenityText));
            BigDecimal distance = asBigDecimal(row.get("distanceKm"));
            if (distance != null) {
                BigDecimal rounded = distance.setScale(1, RoundingMode.HALF_UP);
                item.put("distanceKm", rounded);
                item.put("distanceText", rounded + " km từ hoạt động");
            }
            result.add(item);
        }
        return result;
    }

    private List<String> splitCsv(Object value) {
        if (value == null) return List.of();
        String text = String.valueOf(value);
        if (text.isBlank()) return List.of();
        List<String> result = new ArrayList<>();
        for (String part : text.split(",")) {
            String trimmed = part.trim();
            if (!trimmed.isBlank()) result.add(trimmed);
        }
        return result;
    }

    private BigDecimal asBigDecimal(Object value) {
        if (value == null) return null;
        if (value instanceof BigDecimal decimal) return decimal;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (Exception exception) {
            return null;
        }
    }

    private String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String value : values) {
            if (value != null && !value.isBlank()) return value.trim();
        }
        return null;
    }

    private String like(String value) {
        return "%" + value.toLowerCase(Locale.ROOT).trim() + "%";
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return String.valueOf(value);
        }
    }

    private List<String> defaultSuggestions() {
        return List.of(
                "Tìm homestay ở Cần Thơ dưới 1 triệu",
                "Gợi ý hoạt động ở Đà Nẵng",
                "Cách đặt phòng như thế nào?"
        );
    }
}