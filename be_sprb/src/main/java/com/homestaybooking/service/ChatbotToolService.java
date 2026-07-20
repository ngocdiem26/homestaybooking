package com.homestaybooking.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatbotToolService {

    @PersistenceContext
    private EntityManager entityManager;

    private final JdbcTemplate jdbcTemplate;

    public ChatbotToolService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> searchHomestays(String message) {
        String place = extractPlace(message);
        Integer guests = extractGuests(message);
        BigDecimal maxPrice = extractMaxPrice(message);

        String sql = """
            SELECT
                h.home_id,
                h.home_name,
                h.province,
                h.city,
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
              AND upper(coalesce(h.status, '')) not in ('REJECTED','BLOCKED','DELETED')
              AND (:place IS NULL OR h.city = :place OR h.province = :place OR h.home_address LIKE :placeLike OR h.home_name LIKE :placeLike)
              AND (:guests IS NULL OR h.max_guest >= :guests)
              AND (:maxPrice IS NULL OR h.price_per_night <= :maxPrice)
            ORDER BY h.rating_avg DESC, h.price_per_night ASC
            LIMIT 5
        """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("place", place);
        query.setParameter("placeLike", place == null ? null : "%" + place + "%");
        query.setParameter("guests", guests);
        query.setParameter("maxPrice", maxPrice);

        List<Object[]> rows = query.getResultList();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("homeId", row[0]);
            item.put("homeName", row[1]);
            item.put("province", row[2]);
            item.put("city", row[3]);
            item.put("address", row[4]);
            item.put("pricePerNight", row[5]);
            item.put("maxGuest", row[6]);
            item.put("ratingAvg", row[7]);
            item.put("thumbnailUrl", row[8]);
            result.add(item);
        }

        return result;
    }

    public List<Map<String, Object>> getActivePromotions() {
        try {
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
                WHERE upper(coalesce(status, '')) = 'ACTIVE'
                  AND CURDATE() BETWEEN start_date AND end_date
                ORDER BY discount_value DESC
                LIMIT 5
            """;

            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("promotionId", rs.getInt("promotion_id"));
                item.put("promotionName", rs.getString("promotion_name"));
                item.put("promotionCode", rs.getString("promotion_code"));
                item.put("discountType", rs.getString("discount_type"));
                item.put("discountValue", rs.getBigDecimal("discount_value"));
                item.put("maxDiscount", rs.getBigDecimal("max_discount"));
                item.put("minOrderAmount", rs.getBigDecimal("min_order_amount"));
                item.put("startDate", rs.getDate("start_date") == null ? null : rs.getDate("start_date").toLocalDate().toString());
                item.put("endDate", rs.getDate("end_date") == null ? null : rs.getDate("end_date").toLocalDate().toString());
                return item;
            });
        } catch (Exception exception) {
            return List.of();
        }
    }

    public List<Map<String, Object>> getDestinations() {
        try {
            String sql = """
                SELECT
                    destination_id,
                    province_name,
                    city,
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
                item.put("city", row[2]);
                item.put("displayName", row[3]);
                item.put("slug", row[4]);
                item.put("description", row[5]);
                item.put("thumbnailUrl", row[6]);
                result.add(item);
            }

            return result;
        } catch (Exception exception) {
            return List.of();
        }
    }

    public List<Map<String, Object>> getActivities(String message) {
        try {
            String place = extractProvinceForActivity(message);

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
                  AND (:place IS NULL OR province = :place)
                ORDER BY is_featured DESC, display_order ASC
                LIMIT 5
            """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("place", place);

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

    private String extractPlace(String message) {
        String text = normalize(message);

        if (text.contains("da lat")) return "\u0110\u00e0 L\u1ea1t";
        if (text.contains("lam dong")) return "L\u00e2m \u0110\u1ed3ng";
        if (text.contains("can tho")) return "C\u1ea7n Th\u01a1";
        if (text.contains("sapa") || text.contains("sa pa")) return "Sa Pa";
        if (text.contains("lao cai")) return "L\u00e0o Cai";
        if (text.contains("da nang")) return "\u0110\u00e0 N\u1eb5ng";
        if (text.contains("hoi an")) return "H\u1ed9i An";
        if (text.contains("quang nam")) return "Qu\u1ea3ng Nam";
        if (text.contains("ha noi")) return "H\u00e0 N\u1ed9i";
        if (text.contains("nha trang")) return "Nha Trang";
        if (text.contains("khanh hoa")) return "Kh\u00e1nh H\u00f2a";
        if (text.contains("phu quoc")) return "Ph\u00fa Qu\u1ed1c";
        if (text.contains("kien giang")) return "Ki\u00ean Giang";
        if (text.contains("hue")) return "Hu\u1ebf";
        if (text.contains("thua thien hue")) return "Th\u1eeba Thi\u00ean Hu\u1ebf";
        if (text.contains("ha giang")) return "H\u00e0 Giang";
        if (text.contains("ha long")) return "H\u1ea1 Long";
        if (text.contains("quang ninh")) return "Qu\u1ea3ng Ninh";
        if (text.contains("vung tau")) return "V\u0169ng T\u00e0u";
        if (text.contains("ba ria")) return "B\u00e0 R\u1ecba - V\u0169ng T\u00e0u";

        return null;
    }

    private String extractProvinceForActivity(String message) {
        String place = extractPlace(message);
        if (place == null) return null;
        return switch (place) {
            case "\u0110\u00e0 L\u1ea1t" -> "L\u00e2m \u0110\u1ed3ng";
            case "Sa Pa" -> "L\u00e0o Cai";
            case "H\u1ed9i An" -> "Qu\u1ea3ng Nam";
            case "Nha Trang" -> "Kh\u00e1nh H\u00f2a";
            case "Ph\u00fa Qu\u1ed1c" -> "Ki\u00ean Giang";
            case "Hu\u1ebf" -> "Th\u1eeba Thi\u00ean Hu\u1ebf";
            case "H\u1ea1 Long" -> "Qu\u1ea3ng Ninh";
            case "V\u0169ng T\u00e0u" -> "B\u00e0 R\u1ecba - V\u0169ng T\u00e0u";
            default -> place;
        };
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
        return Normalizer.normalize(input.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace((char) 273, 'd');
    }
}
