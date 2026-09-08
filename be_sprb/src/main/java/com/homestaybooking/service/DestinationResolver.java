package com.homestaybooking.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Component
public class DestinationResolver {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private final JdbcTemplate jdbcTemplate;

    public DestinationResolver(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Chuẩn hóa địa điểm cho các service đang sử dụng DestinationResolver.
     * Ưu tiên bảng destinations. Nếu DB không có kết quả thì chỉ giữ lại dữ liệu thô
     * mà parser đã trích xuất, tuyệt đối không dùng map địa danh hard-code.
     */
    public ResolvedDestination resolve(String destinationKeyword, String city, String province) {
        ResolvedDestination databaseMatched = resolveDatabaseOnly(destinationKeyword, city, province);
        if (databaseMatched != null) {
            return databaseMatched;
        }

        String fallbackCity = firstNonBlank(city, destinationKeyword);
        String fallbackProvince = firstNonBlank(province);
        return new ResolvedDestination(blankToNull(fallbackCity), blankToNull(fallbackProvince));
    }

    /**
     * Chỉ trả kết quả khi tìm được địa điểm ACTIVE trong bảng destinations.
     * Dùng ở tầng intent để city/province cuối cùng luôn lấy từ database.
     */
    public ResolvedDestination resolveDatabaseOnly(String... values) {
        List<String> needles = new ArrayList<>();
        if (values != null) {
            for (String value : values) {
                String normalized = normalize(value);
                if (!normalized.isBlank()) {
                    needles.add(normalized);
                }
            }
        }
        if (needles.isEmpty()) return null;

        List<DestinationRow> rows = loadActiveDestinations();
        if (rows.isEmpty()) return null;

        // 1) Ưu tiên city / display_name / slug để không biến một thành phố thành cả tỉnh.
        for (String needle : needles) {
            DestinationRow best = findBestSpecificMatch(needle, rows);
            if (best != null) {
                return new ResolvedDestination(blankToNull(best.city()), blankToNull(best.province()));
            }
        }

        // 2) Nếu chỉ khớp tên tỉnh thì để city = null, tránh thu hẹp sai phạm vi.
        for (String needle : needles) {
            for (DestinationRow row : rows) {
                if (sameLocationToken(needle, row.province())) {
                    return new ResolvedDestination(null, blankToNull(row.province()));
                }
            }
        }

        return null;
    }

    /**
     * Tìm địa danh xuất hiện trực tiếp trong câu người dùng bằng dữ liệu bảng destinations.
     * Đây là phần thay thế hoàn toàn DESTINATIONS.put(...) trong RuleExtractor.
     */
    public ResolvedDestination resolveFromMessage(String message) {
        String normalizedMessage = normalize(message);
        if (normalizedMessage.isBlank()) return null;

        List<DestinationRow> rows = loadActiveDestinations();
        if (rows.isEmpty()) return null;

        DestinationRow bestSpecific = null;
        int bestScore = -1;

        for (DestinationRow row : rows) {
            int score = specificMessageScore(normalizedMessage, row);
            if (score > bestScore) {
                bestScore = score;
                bestSpecific = row;
            }
        }

        if (bestSpecific != null && bestScore > 0) {
            return new ResolvedDestination(
                    blankToNull(bestSpecific.city()),
                    blankToNull(bestSpecific.province())
            );
        }

        // Không có city cụ thể, thử khớp province.
        DestinationRow bestProvince = null;
        int provinceScore = -1;
        for (DestinationRow row : rows) {
            String province = normalize(row.province());
            if (province.isBlank()) continue;
            if (containsLocation(normalizedMessage, province)) {
                int score = province.length();
                if (score > provinceScore) {
                    provinceScore = score;
                    bestProvince = row;
                }
            }
        }

        if (bestProvince != null) {
            return new ResolvedDestination(null, blankToNull(bestProvince.province()));
        }

        return null;
    }

    private DestinationRow findBestSpecificMatch(String needle, List<DestinationRow> rows) {
        DestinationRow best = null;
        int bestScore = -1;

        for (DestinationRow row : rows) {
            int score = 0;
            if (sameLocationToken(needle, row.city())) score = Math.max(score, 400);
            if (sameLocationToken(needle, row.displayName())) score = Math.max(score, 350);
            if (sameLocationToken(needle, row.slug())) score = Math.max(score, 300);

            // Hỗ trợ Gemini trả về cụm dài hơn như "Đà Lạt, Lâm Đồng".
            if (containsLocation(needle, normalize(row.city()))) score = Math.max(score, 250);
            if (containsLocation(needle, normalize(row.displayName()))) score = Math.max(score, 220);

            if (score > bestScore) {
                bestScore = score;
                best = row;
            }
        }

        return bestScore > 0 ? best : null;
    }

    private int specificMessageScore(String normalizedMessage, DestinationRow row) {
        int score = 0;

        String city = normalize(row.city());
        String displayName = normalize(row.displayName());
        String slug = normalize(row.slug());

        if (!city.isBlank() && containsLocation(normalizedMessage, city)) {
            score = Math.max(score, 400 + city.length());
        }
        if (!displayName.isBlank() && containsLocation(normalizedMessage, displayName)) {
            score = Math.max(score, 350 + displayName.length());
        }
        if (!slug.isBlank() && containsLocation(normalizedMessage, slug)) {
            score = Math.max(score, 300 + slug.length());
        }

        return score;
    }

    private List<DestinationRow> loadActiveDestinations() {
        try {
            return jdbcTemplate.query(
                    """
                    select
                        destination_id,
                        province_name,
                        city,
                        display_name,
                        slug
                    from destinations
                    where deleted_at is null
                      and upper(coalesce(destination_status, 'ACTIVE')) = 'ACTIVE'
                    order by display_order asc, destination_id asc
                    """,
                    (rs, rowNum) -> new DestinationRow(
                            rs.getInt("destination_id"),
                            rs.getString("province_name"),
                            rs.getString("city"),
                            rs.getString("display_name"),
                            rs.getString("slug")
                    )
            );
        } catch (Exception ignored) {
            // Nếu bảng destinations tạm thời không truy cập được, parser vẫn có thể
            // giữ destinationKeyword thô và các rule số khách/giá/ngày vẫn hoạt động.
            return List.of();
        }
    }

    public boolean sameArea(String value, ResolvedDestination destination) {
        if (destination == null || !destination.hasDestination() || value == null || value.isBlank()) {
            return false;
        }

        String normalized = normalize(value);
        return (!isBlank(destination.city()) && containsLocation(normalized, normalize(destination.city())))
                || (!isBlank(destination.province()) && containsLocation(normalized, normalize(destination.province())));
    }

    public String normalize(String value) {
        if (value == null) return "";

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");

        return normalized
                .toLowerCase(Locale.ROOT)
                .replace('đ', 'd')
                .replace('Đ', 'd')
                .replace('-', ' ')
                .replaceAll("\\b(tp|tp\\.|thanh pho|tinh)\\b", " ")
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean sameLocationToken(String normalizedNeedle, String candidate) {
        String normalizedCandidate = normalize(candidate);
        if (normalizedNeedle == null || normalizedNeedle.isBlank() || normalizedCandidate.isBlank()) {
            return false;
        }

        if (normalizedNeedle.equals(normalizedCandidate)) return true;

        String compactNeedle = compact(normalizedNeedle);
        String compactCandidate = compact(normalizedCandidate);
        return !compactNeedle.isBlank() && compactNeedle.equals(compactCandidate);
    }

    private boolean containsLocation(String normalizedText, String normalizedCandidate) {
        if (normalizedText == null || normalizedText.isBlank()
                || normalizedCandidate == null || normalizedCandidate.isBlank()) {
            return false;
        }

        String paddedText = " " + normalizedText + " ";
        String paddedCandidate = " " + normalizedCandidate + " ";
        if (paddedText.contains(paddedCandidate)) return true;

        // Hỗ trợ cách gõ liền như dalat, phuquoc, nhatrang mà không cần alias hard-code.
        String compactCandidate = compact(normalizedCandidate);
        return compactCandidate.length() >= 4
                && compact(normalizedText).contains(compactCandidate);
    }

    private String compact(String value) {
        return value == null ? "" : value.replaceAll("\\s+", "");
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String value : values) {
            if (!isBlank(value)) return value.trim();
        }
        return null;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    public record ResolvedDestination(String city, String province) {
        public boolean hasDestination() {
            return (city != null && !city.isBlank())
                    || (province != null && !province.isBlank());
        }

        public String label() {
            if (city != null && !city.isBlank()
                    && province != null && !province.isBlank()
                    && !city.equalsIgnoreCase(province)) {
                return city + ", " + province;
            }
            if (city != null && !city.isBlank()) return city;
            if (province != null && !province.isBlank()) return province;
            return "khu vực đã chọn";
        }
    }

    private record DestinationRow(
            Integer destinationId,
            String province,
            String city,
            String displayName,
            String slug
    ) {
    }
}
