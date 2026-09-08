package com.homestaybooking.service;

import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class VietnameseChatbotRuleExtractor {

    /*
     * Ngày dạng ISO: 2026-08-20
     */
    private static final Pattern ISO_DATE_PATTERN =
            Pattern.compile("\\b(\\d{4}-\\d{2}-\\d{2})\\b");

    /*
     * Ngày dạng Việt Nam:
     * 20/08/2026, 20-08-2026, 20/08, 20-08.
     * Group 1 = ngày, group 2 = tháng, group 3 = năm (có thể null).
     */
    private static final Pattern NUMERIC_DATE_PATTERN =
            Pattern.compile("\\b(\\d{1,2})[/-](\\d{1,2})(?:[/-](\\d{2,4}))?\\b");

    private final DestinationResolver destinationResolver;

    public VietnameseChatbotRuleExtractor(DestinationResolver destinationResolver) {
        this.destinationResolver = destinationResolver;
    }

    public ChatbotIntentAnalysis extract(String message) {
        String text = normalize(message);
        ChatbotIntentAnalysis analysis = new ChatbotIntentAnalysis();
        ChatbotIntentAnalysis.Entities entities = analysis.getEntities();

        applyDestination(message, entities);
        entities.setGuests(extractGuests(text));
        entities.setDurationDays(extractDuration(text));
        applyDates(message, text, entities);
        applyPrice(stripDateExpressionsForPrice(text), entities);
        entities.setAmenities(extractAmenities(text));
        entities.setServices(extractServices(text));
        applyPreferences(text, entities);
        applyTravelContext(text, entities);
        applyActivity(text, entities);
        applyExplicitCode(message, entities);
        applyRating(text, entities);
        applySort(text, entities);

        String intent = detectIntent(text, entities);
        analysis.setPrimaryIntent(intent);
        analysis.setConfidence("UNKNOWN".equals(intent) ? 0.35 : 0.78);
        analysis.setSecondaryIntents(detectSecondaryIntents(text, entities, intent));
        analysis.setReasoningSummary("Rule-based extractor tiếng Việt đã lấy các ràng buộc rõ ràng trước khi Gemini bổ sung ngữ cảnh.");
        return analysis;
    }

    private void applyDestination(String rawMessage, ChatbotIntentAnalysis.Entities entities) {
        DestinationResolver.ResolvedDestination resolved = destinationResolver.resolveFromMessage(rawMessage);
        if (resolved == null || !resolved.hasDestination()) return;

        entities.setCity(resolved.city());
        entities.setProvince(resolved.province());
        entities.setDestinationKeyword(
                resolved.city() != null && !resolved.city().isBlank()
                        ? resolved.city()
                        : resolved.province()
        );
    }

    private Integer extractGuests(String text) {
        Matcher matcher = Pattern.compile("(\\d+)\\s*(nguoi|khach)").matcher(text);
        if (matcher.find()) return safeInteger(matcher.group(1));
        if (containsAny(text, "hai nguoi", "2 nguoi")) return 2;
        if (containsAny(text, "ba nguoi", "3 nguoi")) return 3;
        if (containsAny(text, "bon nguoi", "4 nguoi", "gia dinh 4")) return 4;
        if (containsAny(text, "nam nguoi", "5 nguoi")) return 5;
        if (containsAny(text, "sau nguoi", "6 nguoi")) return 6;
        return null;
    }

    private Integer extractDuration(String text) {
        Matcher matcher = Pattern.compile("(\\d+)\\s*(ngay|dem)").matcher(text);
        if (matcher.find()) return safeInteger(matcher.group(1));
        if (containsAny(text, "mot ngay", "mot dem")) return 1;
        if (containsAny(text, "hai ngay", "hai dem")) return 2;
        if (containsAny(text, "ba ngay", "ba dem")) return 3;
        if (containsAny(text, "bon ngay", "bon dem")) return 4;
        if (containsAny(text, "nam ngay", "nam dem")) return 5;
        return null;
    }

    private void applyDates(String rawMessage, String normalizedText, ChatbotIntentAnalysis.Entities entities) {
        LocalDate today = LocalDate.now();

        if (containsAny(normalizedText, "ngay mai", "mai di", "mai toi", "mai den")) {
            entities.setCheckIn(today.plusDays(1).toString());
        }

        String raw = rawMessage == null ? "" : rawMessage;
        List<LocalDate> dates = new ArrayList<>();

        Matcher isoMatcher = ISO_DATE_PATTERN.matcher(raw);
        while (isoMatcher.find() && dates.size() < 2) {
            try {
                dates.add(LocalDate.parse(isoMatcher.group(1), DateTimeFormatter.ISO_LOCAL_DATE));
            } catch (DateTimeParseException ignored) {
                // ignore
            }
        }

        if (dates.isEmpty()) {
            Matcher matcher = NUMERIC_DATE_PATTERN.matcher(raw);
            while (matcher.find() && dates.size() < 2) {
                LocalDate parsed = parseDate(matcher.group(1), matcher.group(2), matcher.group(3), today);
                if (parsed != null) dates.add(parsed);
            }
        }

        if (!dates.isEmpty()) entities.setCheckIn(dates.get(0).toString());
        if (dates.size() >= 2) entities.setCheckOut(dates.get(1).toString());

        if (entities.getCheckIn() != null && entities.getCheckOut() == null && entities.getDurationDays() != null) {
            try {
                LocalDate checkIn = LocalDate.parse(entities.getCheckIn());
                entities.setCheckOut(checkIn.plusDays(Math.max(1, entities.getDurationDays())).toString());
            } catch (DateTimeParseException ignored) {
                // Gemini sẽ bổ sung nếu cần.
            }
        }

        if (entities.getCheckIn() != null || entities.getCheckOut() != null) {
            entities.setNeedAvailability(true);
        }
    }

    private LocalDate parseDate(String dayText, String monthText, String yearText, LocalDate today) {
        try {
            int day = Integer.parseInt(dayText);
            int month = Integer.parseInt(monthText);
            int year;
            if (yearText == null || yearText.isBlank()) {
                year = today.getYear();
                LocalDate candidate = LocalDate.of(year, month, day);
                if (candidate.isBefore(today.minusDays(1))) candidate = candidate.plusYears(1);
                return candidate;
            }
            year = Integer.parseInt(yearText);
            if (year < 100) year += 2000;
            return LocalDate.of(year, month, day);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private void applyPrice(String text, ChatbotIntentAnalysis.Entities entities) {
        if (text == null || text.isBlank()) return;

        Matcher range = Pattern.compile(
                "(\\d+(?:[.,]\\d+)?)\\s*(k|tr|trieu)?\\s*(?:-|den|toi)\\s*(\\d+(?:[.,]\\d+)?)\\s*(k|tr|trieu)?"
        ).matcher(text);
        if (range.find()) {
            String unit1 = range.group(2);
            String unit2 = range.group(4);
            boolean hasCurrencyUnit = unit1 != null || unit2 != null;
            boolean hasPriceContext = containsAny(text, "gia", "ngan sach", "muc gia", "gia phong");
            if (hasCurrencyUnit || hasPriceContext) {
                if (unit1 == null) unit1 = unit2;
                if (unit2 == null) unit2 = unit1;
                BigDecimal min = money(range.group(1), unit1);
                BigDecimal max = money(range.group(3), unit2);
                if (min != null && max != null) {
                    entities.setMinPrice(min.min(max));
                    entities.setMaxPrice(min.max(max));
                    return;
                }
            }
        }

        Matcher under = Pattern.compile(
                "(?:duoi|<|nho hon|khong qua|toi da)\\s*(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|k)?"
        ).matcher(text);
        if (under.find()) {
            entities.setMaxPrice(money(under.group(1), under.group(2)));
            return;
        }

        Matcher above = Pattern.compile(
                "(?:tren|>|tu)\\s*(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|k)"
        ).matcher(text);
        if (above.find()) {
            entities.setMinPrice(money(above.group(1), above.group(2)));
            return;
        }

        Matcher around = Pattern.compile(
                "(?:khoang|tam|ngan sach)\\s*(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|k)"
        ).matcher(text);
        if (around.find()) {
            entities.setPricePerNight(money(around.group(1), around.group(2)));
        }
    }

    private String stripDateExpressionsForPrice(String text) {
        if (text == null || text.isBlank()) return "";
        return text
                .replaceAll("(?<!\\d)\\d{4}-\\d{1,2}-\\d{1,2}(?!\\d)", " ")
                .replaceAll("(?<!\\d)\\d{1,2}[/-]\\d{1,2}(?:[/-]\\d{2,4})?(?!\\d)", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private BigDecimal money(String numberText, String unit) {
        try {
            BigDecimal number = new BigDecimal(numberText.replace(',', '.'));
            String normalizedUnit = unit == null ? "" : unit;
            if (normalizedUnit.startsWith("k")) return number.multiply(BigDecimal.valueOf(1_000));
            if (normalizedUnit.startsWith("tr")) return number.multiply(BigDecimal.valueOf(1_000_000));
            if (number.compareTo(BigDecimal.valueOf(10_000)) < 0) return number.multiply(BigDecimal.valueOf(1_000_000));
            return number;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private List<String> extractAmenities(String text) {
        List<String> amenities = new ArrayList<>();
        addIf(text, amenities, "Wi-Fi", "wifi", "wi fi", "wi-fi");
        addIf(text, amenities, "Bếp", "co bep", "nau an", "bep");
        addIf(text, amenities, "Chỗ đậu xe", "dau xe", "cho dau xe", "bai dau xe");
        addIf(text, amenities, "Máy giặt", "may giat");
        addIf(text, amenities, "TV", "tv", "tivi");
        addIf(text, amenities, "Máy lạnh", "may lanh", "dieu hoa");
        addIf(text, amenities, "Hồ bơi", "ho boi");
        addIf(text, amenities, "Ban công", "ban cong");
        addIf(text, amenities, "Nước nóng", "nuoc nong");
        addIf(text, amenities, "Máy sấy tóc", "may say toc");
        addIf(text, amenities, "Sân vườn", "san vuon", "vuon rong");
        return amenities;
    }

    private List<String> extractServices(String text) {
        List<String> services = new ArrayList<>();
        addIf(text, services, "Tiệc BBQ ngoài trời", "bbq", "tiec nuong", "nuong ngoai troi");
        addIf(text, services, "Thuê xe máy", "thue xe may", "thue xe");
        addIf(text, services, "Đưa đón sân bay", "dua don san bay", "don san bay");
        addIf(text, services, "Dọn phòng hằng ngày", "don phong", "don phong hang ngay");
        addIf(text, services, "Giặt sấy", "giat say", "giat do");
        addIf(text, services, "Cho thuê dàn loa", "dan loa", "thue loa", "loa keo");
        return services;
    }

    private void applyPreferences(String text, ChatbotIntentAnalysis.Entities entities) {
        List<String> preferences = new ArrayList<>();
        addIf(text, preferences, "view đẹp", "view dep", "canh dep");
        addIf(text, preferences, "view sông", "view song", "ven song");
        addIf(text, preferences, "view biển", "view bien", "gan bien");
        addIf(text, preferences, "view núi", "view nui", "gan nui");
        addIf(text, preferences, "ban công", "ban cong");
        addIf(text, preferences, "sân vườn", "san vuon", "vuon");
        addIf(text, preferences, "yên tĩnh", "yen tinh", "nghi duong", "thu gian");
        addIf(text, preferences, "gần trung tâm", "gan trung tam", "trung tam");
        addIf(text, preferences, "lãng mạn", "lang man");
        addIf(text, preferences, "ấm cúng", "am cung");
        if (!preferences.isEmpty()) {
            entities.setPreferenceKeywords(preferences);
            entities.setViewPreference(String.join(", ", preferences));
        }
    }

    private void applyTravelContext(String text, ChatbotIntentAnalysis.Entities entities) {
        if (containsAny(text, "gia dinh", "tre em", "con nho", "ba me")) {
            entities.setFamilyTrip(true);
            entities.setGroupType("FAMILY");
        } else if (containsAny(text, "cap doi", "lang man", "vo chong")) {
            entities.setGroupType("COUPLE");
            entities.setTravelStyle("ROMANTIC");
        } else if (containsAny(text, "ban be", "nhom ban")) {
            entities.setGroupType("FRIENDS");
        }

        if (containsAny(text, "nghi duong", "yen tinh", "khong muon di nhieu", "thu gian", "nhe nhang")) {
            entities.setTravelStyle("RELAXING");
            entities.setPace("SLOW");
        } else if (containsAny(text, "kham pha", "di nhieu", "trai nghiem", "phieu luu", "trekking")) {
            entities.setTravelStyle("DISCOVERY");
            entities.setPace("FAST");
        }

        if (entities.getDurationDays() != null && containsAny(text, "lich trinh", "ke hoach", "goi y lich")) {
            entities.setNeedItinerary(true);
        }
        if (containsAny(text, "goi y homestay", "tim homestay", "cho nghi")) {
            entities.setNeedHomestaySuggestion(true);
        }
    }

    private void applyActivity(String text, ChatbotIntentAnalysis.Entities entities) {
        if (containsAny(text, "gan hoat dong", "trai nghiem thu vi", "cho choi", "tham quan", "gan dia diem")) {
            entities.setNeedNearbyActivities(true);
        }

        if (containsAny(text, "cheo thuyen", "cho noi")) {
            entities.setActivityKeyword(text.contains("cho noi") ? "chợ nổi" : "chèo thuyền");
            entities.setNeedNearbyActivities(true);
        } else if (containsAny(text, "leo nui", "trekking")) {
            entities.setActivityKeyword("leo núi");
            entities.setNeedNearbyActivities(true);
        } else if (containsAny(text, "bien", "tam bien")) {
            entities.setActivityKeyword("biển");
            entities.setNeedNearbyActivities(true);
        } else if (containsAny(text, "nong trai", "trai rau", "vuon rau")) {
            entities.setActivityKeyword("nông trại");
            entities.setNeedNearbyActivities(true);
        } else if (containsAny(text, "am thuc", "nau an", "lam banh")) {
            entities.setActivityKeyword("ẩm thực");
        }
    }

    private void applyExplicitCode(String message, ChatbotIntentAnalysis.Entities entities) {
        if (message == null) return;
        Matcher matcher = Pattern.compile("\\b[A-Z0-9][A-Z0-9_-]{4,24}\\b").matcher(message.toUpperCase());
        if (matcher.find()) entities.setPromotionCode(matcher.group());
    }

    private void applyRating(String text, ChatbotIntentAnalysis.Entities entities) {
        Matcher matcher = Pattern.compile("(?:tu|tren|it nhat)\\s*([1-5](?:[.,]\\d)?)\\s*(?:sao|star)?").matcher(text);
        if (matcher.find()) {
            try {
                entities.setRatingMin(new BigDecimal(matcher.group(1).replace(',', '.')));
            } catch (NumberFormatException ignored) {
                // ignore
            }
        }
    }

    private void applySort(String text, ChatbotIntentAnalysis.Entities entities) {
        if (containsAny(text, "re nhat", "gia thap", "tu thap den cao")) entities.setSortBy("PRICE_ASC");
        else if (containsAny(text, "dat nhat", "gia cao", "tu cao den thap")) entities.setSortBy("PRICE_DESC");
        else if (containsAny(text, "danh gia cao", "rating cao", "tot nhat")) entities.setSortBy("RATING_DESC");
        else if (containsAny(text, "pho bien", "nhieu nguoi dat")) entities.setSortBy("POPULARITY_DESC");
        else if (containsAny(text, "gan nhat", "gan hoat dong")) entities.setSortBy("DISTANCE_ASC");
    }

    private String detectIntent(String text, ChatbotIntentAnalysis.Entities entities) {
        if (containsAny(text, "xin chao", "chao ban", "hello", "hi", "helo")) return "GREETING";
        if (containsAny(text, "yeu thich cua toi", "danh sach yeu thich", "favorite cua toi")) return "USER_FAVORITES_LOOKUP";
        if (containsAny(text, "hang thanh vien", "cap bac thanh vien", "tier cua toi", "toi dang hang gi")) return "USER_TIER_LOOKUP";
        if (containsAny(text, "lich su dat phong", "cac don cua toi", "booking cua toi")) return "USER_BOOKING_HISTORY_LOOKUP";
        if (containsAny(text, "trang thai don", "don cua toi", "kiem tra booking")) return "BOOKING_STATUS";
        if (containsAny(text, "khuyen mai", "ma giam", "voucher", "uu dai", "coupon")) return "PROMOTION_LOOKUP";
        if (containsAny(text, "so sanh homestay", "so sanh 2", "so sanh hai")) return "HOMESTAY_COMPARE";
        if (containsAny(text, "review", "danh gia ve", "nhan xet ve", "tom tat danh gia")) return "HOMESTAY_REVIEW_SUMMARY";
        if (containsAny(text, "con phong", "trong phong", "kiem tra lich trong", "co phong ngay", "availability")) {
            entities.setNeedAvailability(true);
            return "AVAILABILITY_CHECK";
        }
        if (containsAny(text, "chi tiet homestay", "thong tin homestay")) return "HOMESTAY_DETAIL";
        if (containsAny(text, "huy don", "hoan tien", "refund", "chinh sach huy")) return "REFUND_OR_CANCEL_GUIDE";
        if (containsAny(text, "vnpay")) return "VNPAY_GUIDE";
        if (containsAny(text, "thanh toan tai cho", "tra tai cho")) return "PAY_AT_PROPERTY_GUIDE";
        if (containsAny(text, "thanh toan", "tra tien")) return "PAYMENT_GUIDE";
        if (containsAny(text, "khieu nai", "phan anh", "bao cao")) return "COMPLAINT_GUIDE";
        if (containsAny(text, "huong dan dat", "cach dat phong", "dat phong nhu the nao")) return "BOOKING_GUIDE";
        if (containsAny(text, "chinh sach", "quy dinh")) return "POLICY_QA";
        if (containsAny(text, "lich trinh", "ke hoach di choi") || Boolean.TRUE.equals(entities.getNeedItinerary())) return "TRIP_PLANNING";
        if (Boolean.TRUE.equals(entities.getNeedNearbyActivities()) && containsAny(text, "homestay", "cho nghi", "luu tru")) return "SEARCH_HOMESTAY_NEAR_ACTIVITY";
        if (containsAny(text, "hoat dong", "trai nghiem", "tham quan", "cheo thuyen", "cho noi", "leo nui", "choi gi")) return "ACTIVITY_SUGGESTION";
        if (containsAny(text, "homestay", "cho nghi", "luu tru") || entities.getCity() != null || entities.getMaxPrice() != null || entities.getGuests() != null || !entities.getAmenities().isEmpty() || !entities.getServices().isEmpty()) return "SEARCH_HOMESTAY";
        if (containsAny(text, "dia diem", "diem den", "du lich dep", "nen di dau")) return "DESTINATION_SUGGESTION";
        if (containsAny(text, "faq", "tro giup", "ho tro")) return "FAQ_QA";
        return "UNKNOWN";
    }

    private List<String> detectSecondaryIntents(String text, ChatbotIntentAnalysis.Entities entities, String primaryIntent) {
        List<String> secondary = new ArrayList<>();
        if (!"SEARCH_HOMESTAY".equals(primaryIntent) && containsAny(text, "homestay", "cho nghi", "luu tru")) secondary.add("SEARCH_HOMESTAY");
        if (!"ACTIVITY_SUGGESTION".equals(primaryIntent) && Boolean.TRUE.equals(entities.getNeedNearbyActivities())) secondary.add("ACTIVITY_SUGGESTION");
        if (entities.getDurationDays() != null && containsAny(text, "lich trinh", "di choi", "ngay")) secondary.add("ITINERARY_GENERATION");
        if (Boolean.TRUE.equals(entities.getNeedAvailability()) && !"AVAILABILITY_CHECK".equals(primaryIntent)) secondary.add("AVAILABILITY_CHECK");
        return secondary.stream().distinct().toList();
    }

    private void addIf(String text, List<String> result, String value, String... keywords) {
        if (containsAny(text, keywords) && !result.contains(value)) result.add(value);
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (containsPhrase(text, keyword)) return true;
        }
        return false;
    }

    private boolean containsPhrase(String text, String phrase) {
        if (text == null || phrase == null) return false;
        String wrapped = " " + text.trim().replaceAll("\\s+", " ") + " ";
        String needle = " " + phrase.trim().replaceAll("\\s+", " ") + " ";
        return wrapped.contains(needle);
    }

    private Integer safeInteger(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    public String normalize(String input) {
        if (input == null) return "";
        return Normalizer.normalize(input.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replaceAll("[^a-z0-9:/._+\\-\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
