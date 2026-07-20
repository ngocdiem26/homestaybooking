package com.homestaybooking.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotToolService {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Map<String, Object>> searchHomestays(String message) {
        String province = extractProvince(message);
        Integer guests = extractGuests(message);
        BigDecimal maxPrice = extractMaxPrice(message);

        String sql = """
            SELECT
                h.home_id,
                h.home_name,
                h.province,
                h.home_address,
                h.price_per_night,
                h.max_guest,
                h.rating_avg,
                (
                    SELECT hi.image_url
                    FROM homestay_images hi
                    WHERE hi.home_id = h.home_id
                    ORDER BY hi.is_main DESC, hi.sort_order ASC
                    LIMIT 1
                ) AS thumbnail_url
            FROM homestays h
            WHERE h.deleted_at IS NULL
              AND h.status = 'APPROVED'
              AND (:province IS NULL OR h.province = :province)
              AND (:guests IS NULL OR h.max_guest >= :guests)
              AND (:maxPrice IS NULL OR h.price_per_night <= :maxPrice)
            ORDER BY h.rating_avg DESC, h.price_per_night ASC
            LIMIT 5
        """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("province", province);
        query.setParameter("guests", guests);
        query.setParameter("maxPrice", maxPrice);

        List<Object[]> rows = query.getResultList();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("homeId", row[0]);
            item.put("homeName", row[1]);
            item.put("province", row[2]);
            item.put("address", row[3]);
            item.put("pricePerNight", row[4]);
            item.put("maxGuest", row[5]);
            item.put("ratingAvg", row[6]);
            item.put("thumbnailUrl", row[7]);
            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getActivePromotions() {
        String sql = """
            SELECT
                promotion_id,
                promotion_name,
                promotion_code,
                discount_type,
                discount_value,
                max_discount,
                min_order_amount,
                start_date,
                end_date
            FROM promotions
            WHERE status = 'ACTIVE'
              AND CURDATE() BETWEEN start_date AND end_date
            ORDER BY discount_value DESC
            LIMIT 5
        """;

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("promotionId", row[0]);
            item.put("promotionName", row[1]);
            item.put("promotionCode", row[2]);
            item.put("discountType", row[3]);
            item.put("discountValue", row[4]);
            item.put("maxDiscount", row[5]);
            item.put("minOrderAmount", row[6]);
            item.put("startDate", row[7]);
            item.put("endDate", row[8]);
            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getDestinations() {
        try {
            String sql = """
                SELECT
                    destination_id,
                    province_name,
                    display_name,
                    slug,
                    description,
                    thumbnail_url
                FROM destinations
                WHERE destination_status = 'ACTIVE'
                  AND deleted_at IS NULL
                ORDER BY display_order ASC
                LIMIT 6
            """;

            List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Object[] row : rows) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("destinationId", row[0]);
                item.put("provinceName", row[1]);
                item.put("displayName", row[2]);
                item.put("slug", row[3]);
                item.put("description", row[4]);
                item.put("thumbnailUrl", row[5]);
                result.add(item);
            }

            return result;
        } catch (Exception exception) {
            return List.of();
        }
    }

    public List<Map<String, Object>> getActivities(String message) {
        try {
            String province = extractProvince(message);

            String sql = """
                SELECT
                    activity_id,
                    activity_name,
                    province,
                    short_description,
                    thumbnail_url,
                    badge_text
                FROM activities
                WHERE activity_status = 'ACTIVE'
                  AND deleted_at IS NULL
                  AND (:province IS NULL OR province = :province)
                ORDER BY is_featured DESC, display_order ASC
                LIMIT 5
            """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("province", province);

            List<Object[]> rows = query.getResultList();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Object[] row : rows) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("activityId", row[0]);
                item.put("activityName", row[1]);
                item.put("province", row[2]);
                item.put("shortDescription", row[3]);
                item.put("thumbnailUrl", row[4]);
                item.put("badgeText", row[5]);
                result.add(item);
            }

            return result;
        } catch (Exception exception) {
            return List.of();
        }
    }

    private String extractProvince(String message) {
        String text = normalize(message);

        if (text.contains("da lat") || text.contains("lam dong")) return "Lâm Đồng";
        if (text.contains("can tho")) return "Cần Thơ";
        if (text.contains("da nang")) return "Đà Nẵng";
        if (text.contains("hoi an") || text.contains("quang nam")) return "Quảng Nam";
        if (text.contains("ha noi")) return "Hà Nội";
        if (text.contains("nha trang") || text.contains("khanh hoa")) return "Khánh Hòa";
        if (text.contains("phu quoc") || text.contains("kien giang")) return "Kiên Giang";
        if (text.contains("hue") || text.contains("thua thien hue")) return "Thừa Thiên Huế";
        if (text.contains("ha giang")) return "Hà Giang";
        if (text.contains("ha long") || text.contains("quang ninh")) return "Quảng Ninh";
        if (text.contains("vung tau")) return "Bà Rịa - Vũng Tàu";

        return null;
    }

    private Integer extractGuests(String message) {
        String text = normalize(message);
        Pattern pattern = Pattern.compile("(\\d+)\\s*(nguoi|khach)");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return null;
    }

    private BigDecimal extractMaxPrice(String message) {
        String text = normalize(message);

        if (text.contains("duoi 500") || text.contains("duoi 500k")) return new BigDecimal("500000");
        if (text.contains("duoi 1 trieu") || text.contains("duoi 1tr")) return new BigDecimal("1000000");
        if (text.contains("duoi 2 trieu") || text.contains("duoi 2tr")) return new BigDecimal("2000000");
        if (text.contains("duoi 3 trieu") || text.contains("duoi 3tr")) return new BigDecimal("3000000");

        return null;
    }

    private String normalize(String input) {
        if (input == null) return "";
        String text = input.toLowerCase();
        text = text.replace("đ", "d");
        text = text.replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a");
        text = text.replaceAll("[éèẻẽẹêếềểễệ]", "e");
        text = text.replaceAll("[íìỉĩị]", "i");
        text = text.replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o");
        text = text.replaceAll("[úùủũụưứừửữự]", "u");
        text = text.replaceAll("[ýỳỷỹỵ]", "y");
        return text;
    }
}