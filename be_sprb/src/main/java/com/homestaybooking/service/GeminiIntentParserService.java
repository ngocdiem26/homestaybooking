package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiIntentParserService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public ChatbotIntentAnalysis parse(
            String message,
            ChatbotIntentAnalysis ruleBased
    ) {
        return parse(message, ruleBased, null, "");
    }

    public ChatbotIntentAnalysis parse(
            String message,
            ChatbotIntentAnalysis ruleBased,
            ChatbotIntentAnalysis previousAnalysis,
            String conversationTranscript
    ) {
        String prompt = buildPrompt(
                message,
                ruleBased,
                previousAnalysis,
                conversationTranscript
        );

        String fallbackJson = toJson(ruleBased);

        ChatbotIntentAnalysis parsed =
                tryParse(geminiService.generateJsonAnswer(prompt, fallbackJson));

        if (parsed != null) {
            return merge(ruleBased, parsed);
        }

        String retryPrompt = prompt
                + "\nCHỈ TRẢ VỀ JSON HỢP LỆ. Không dùng markdown hoặc giải thích.";

        parsed = tryParse(
                geminiService.generateJsonAnswer(
                        retryPrompt,
                        fallbackJson
                )
        );

        return parsed == null
                ? ruleBased
                : merge(ruleBased, parsed);
    }

    private String buildPrompt(
            String message,
            ChatbotIntentAnalysis ruleBased,
            ChatbotIntentAnalysis previousAnalysis,
            String conversationTranscript
    ) {
        return """
                Bạn là bộ phân tích intent cho chatbot Cozygo Homestay Booking.
                Nhiệm vụ: đọc câu hỏi tiếng Việt, hiểu ngữ cảnh du lịch và trả về JSON đúng schema.
                Không trả markdown. Không giải thích ngoài JSON. Không sinh SQL. Không bịa dữ liệu.
                TRIP_PLANNING và ITINERARY_GENERATION chỉ dùng để nhận biết nhu cầu tạo lịch trình; chatbot sẽ chuyển nhu cầu này sang chức năng Tạo lịch trình AI riêng, không tự sinh lịch trình mẫu.

                Intent hợp lệ:
                GREETING, SEARCH_HOMESTAY, SEARCH_HOMESTAY_BY_DESTINATION, SEARCH_HOMESTAY_BY_PRICE,
                SEARCH_HOMESTAY_BY_AMENITY, SEARCH_HOMESTAY_BY_CAPACITY, SEARCH_HOMESTAY_NEAR_ACTIVITY,
                HOMESTAY_DETAIL, HOMESTAY_COMPARE, HOMESTAY_REVIEW_SUMMARY, AVAILABILITY_CHECK,
                DESTINATION_SUGGESTION, ACTIVITY_SUGGESTION, NEARBY_ACTIVITY_LOOKUP, PROMOTION_LOOKUP,
                BEST_DEAL_LOOKUP, TRIP_PLANNING, ITINERARY_GENERATION, BOOKING_GUIDE, BOOKING_STATUS,
                PAYMENT_GUIDE, VNPAY_GUIDE, PAY_AT_PROPERTY_GUIDE, COMPLAINT_GUIDE, REFUND_OR_CANCEL_GUIDE,
                USER_FAVORITES_LOOKUP, USER_BOOKING_HISTORY_LOOKUP, USER_TIER_LOOKUP, POLICY_QA, FAQ_QA,
                OUT_OF_SCOPE, UNKNOWN.

                Ví dụ:
                - "Tôi đi Đà Lạt 3 ngày với gia đình, thích nghỉ dưỡng, không muốn đi quá nhiều" => TRIP_PLANNING, city=Đà Lạt, durationDays=3, groupType=FAMILY, travelStyle=RELAXING, pace=SLOW, needHomestaySuggestion=true, needItinerary=true.
                - "homestay gần chèo thuyền dưới 1 triệu có bếp cho 4 người" => SEARCH_HOMESTAY_NEAR_ACTIVITY, activityKeyword=chèo thuyền, maxPrice=1000000, amenities=["Bếp"], guests=4, sortBy=DISTANCE_ASC.

                Ngữ cảnh hội thoại gần nhất:
                %s

                Phân tích của lượt trước:
                %s

                Rule-based draft của câu hiện tại:
                %s

                Câu hỏi hiện tại:
                %s

                JSON schema:
                {
                  "primaryIntent": "SEARCH_HOMESTAY",
                  "secondaryIntents": [],
                  "confidence": 0.0,
                  "language": "vi",
                  "entities": {
                    "city": null,
                    "province": null,
                    "destinationKeyword": null,
                    "checkIn": null,
                    "checkOut": null,
                    "durationDays": null,
                    "guests": null,
                    "adults": null,
                    "children": null,
                    "familyTrip": false,
                    "groupType": "UNKNOWN",
                    "travelStyle": "UNKNOWN",
                    "pace": "MEDIUM",
                    "minPrice": null,
                    "maxPrice": null,
                    "pricePerNight": null,
                    "amenities": [],
                    "services": [],
                    "activityKeyword": null,
                    "homestayName": null,
                    "promotionCode": null,
                    "ratingMin": null,
                    "preferenceKeywords": [],
                    "viewPreference": null,
                    "needNearbyActivities": false,
                    "needHomestaySuggestion": false,
                    "needItinerary": false,
                    "needAvailability": false,
                    "sortBy": "RELEVANCE"
                  },
                  "clarification": {
                    "needAskMore": false,
                    "question": null,
                    "missingFields": []
                  },
                  "reasoningSummary": "Tóm tắt ngắn bằng tiếng Việt vì sao phân loại như vậy"
                }
                """.formatted(
                conversationTranscript == null || conversationTranscript.isBlank()
                        ? "(chưa có hội thoại trước)"
                        : conversationTranscript,
                previousAnalysis == null
                        ? "{}"
                        : toJson(previousAnalysis),
                toJson(ruleBased),
                message == null ? "" : message
        );
    }

    private ChatbotIntentAnalysis tryParse(String raw) {
        try {
            String json = extractJson(raw);
            if (json == null || json.isBlank()) return null;
            return objectMapper.readValue(json, ChatbotIntentAnalysis.class);
        } catch (Exception exception) {
            return null;
        }
    }

    private String extractJson(String raw) {
        if (raw == null) return null;
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
        }
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) return cleaned.substring(start, end + 1);
        return cleaned;
    }

    private ChatbotIntentAnalysis merge(ChatbotIntentAnalysis ruleBased, ChatbotIntentAnalysis parsed) {
        if (parsed.getPrimaryIntent() == null || "UNKNOWN".equals(parsed.getPrimaryIntent())) parsed.setPrimaryIntent(ruleBased.getPrimaryIntent());
        if (parsed.getConfidence() == null || parsed.getConfidence() <= 0.0) parsed.setConfidence(ruleBased.getConfidence());

        ChatbotIntentAnalysis.Entities rule = ruleBased.getEntities();
        ChatbotIntentAnalysis.Entities entity = parsed.getEntities();
        if (isBlank(entity.getCity())) entity.setCity(rule.getCity());
        if (isBlank(entity.getProvince())) entity.setProvince(rule.getProvince());
        if (isBlank(entity.getDestinationKeyword())) entity.setDestinationKeyword(rule.getDestinationKeyword());
        if (entity.getCheckIn() == null) entity.setCheckIn(rule.getCheckIn());
        if (entity.getCheckOut() == null) entity.setCheckOut(rule.getCheckOut());
        if (entity.getDurationDays() == null) entity.setDurationDays(rule.getDurationDays());
        if (entity.getGuests() == null) entity.setGuests(rule.getGuests());
        if (entity.getAdults() == null) entity.setAdults(rule.getAdults());
        if (entity.getChildren() == null) entity.setChildren(rule.getChildren());
        if (!Boolean.TRUE.equals(entity.getFamilyTrip())) entity.setFamilyTrip(rule.getFamilyTrip());
        if (isBlankOrUnknown(entity.getGroupType())) entity.setGroupType(rule.getGroupType());
        if (isBlankOrUnknown(entity.getTravelStyle())) entity.setTravelStyle(rule.getTravelStyle());
        if (isBlank(entity.getPace())) entity.setPace(rule.getPace());
        if (entity.getMinPrice() == null) entity.setMinPrice(rule.getMinPrice());
        if (entity.getMaxPrice() == null) entity.setMaxPrice(rule.getMaxPrice());
        if (entity.getPricePerNight() == null) entity.setPricePerNight(rule.getPricePerNight());
        if (entity.getAmenities().isEmpty()) entity.setAmenities(rule.getAmenities());
        if (entity.getServices().isEmpty()) entity.setServices(rule.getServices());
        if (isBlank(entity.getActivityKeyword())) entity.setActivityKeyword(rule.getActivityKeyword());
        if (isBlank(entity.getHomestayName())) entity.setHomestayName(rule.getHomestayName());
        if (isBlank(entity.getPromotionCode())) entity.setPromotionCode(rule.getPromotionCode());
        if (entity.getRatingMin() == null) entity.setRatingMin(rule.getRatingMin());
        if (entity.getPreferenceKeywords().isEmpty()) entity.setPreferenceKeywords(rule.getPreferenceKeywords());
        if (isBlank(entity.getViewPreference())) entity.setViewPreference(rule.getViewPreference());
        if (!Boolean.TRUE.equals(entity.getNeedNearbyActivities())) entity.setNeedNearbyActivities(rule.getNeedNearbyActivities());
        if (!Boolean.TRUE.equals(entity.getNeedHomestaySuggestion())) entity.setNeedHomestaySuggestion(rule.getNeedHomestaySuggestion());
        if (!Boolean.TRUE.equals(entity.getNeedItinerary())) entity.setNeedItinerary(rule.getNeedItinerary());
        if (!Boolean.TRUE.equals(entity.getNeedAvailability())) entity.setNeedAvailability(rule.getNeedAvailability());
        if (isBlank(entity.getSortBy())) entity.setSortBy(rule.getSortBy());

        List<String> mergedSecondary = new ArrayList<>();
        if (ruleBased.getSecondaryIntents() != null) mergedSecondary.addAll(ruleBased.getSecondaryIntents());
        if (parsed.getSecondaryIntents() != null) mergedSecondary.addAll(parsed.getSecondaryIntents());
        parsed.setSecondaryIntents(mergedSecondary.stream().distinct().toList());
        return parsed;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isBlankOrUnknown(String value) {
        return isBlank(value) || "UNKNOWN".equalsIgnoreCase(value);
    }
}