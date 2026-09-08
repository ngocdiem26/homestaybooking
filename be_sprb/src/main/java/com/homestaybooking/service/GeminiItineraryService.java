package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.homestaybooking.dto.request.AiItineraryGenerateRequest;
import com.homestaybooking.dto.request.CustomPlaceRequest;
import com.homestaybooking.dto.response.ActivitySuggestionResponse;
import com.homestaybooking.dto.response.ItineraryValidationViolation;
import com.homestaybooking.exception.ItineraryGenerationException;
import com.homestaybooking.service.ItineraryPlanningConstraintService.PlanningConstraints;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiItineraryService {

    private static final int ITINERARY_JSON_MAX_TOKENS = 8192;

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public JsonNode generateItinerary(
            AiItineraryGenerateRequest request,
            List<ActivitySuggestionResponse> activities,
            Map<String, Object> selectedHomestay,
            String itineraryCode,
            PlanningConstraints constraints
    ) {
        return generateFromPrompt(
                buildPrompt(
                        request,
                        activities,
                        selectedHomestay,
                        itineraryCode,
                        constraints
                )
        );
    }

    public JsonNode retryItinerary(
            AiItineraryGenerateRequest request,
            List<ActivitySuggestionResponse> activities,
            Map<String, Object> selectedHomestay,
            String itineraryCode,
            PlanningConstraints constraints,
            List<ItineraryValidationViolation> violations
    ) {
        String retryPrompt = buildPrompt(
                request,
                activities,
                selectedHomestay,
                itineraryCode,
                constraints
        ) + """

                KẾT QUẢ TRƯỚC ĐÓ KHÔNG HỢP LỆ.
                Các lỗi backend phát hiện:
                %s

                Hãy tạo lại TOÀN BỘ JSON một lần nữa và sửa tất cả lỗi trên.
                Không được thay đổi các mục trong lockedSelectedActivities hoặc lockedCustomPlaces.
                Không được bỏ các địa điểm riêng bắt buộc của người dùng.
                Nếu một hoạt động tùy chọn không thể xếp hợp lệ, hãy bỏ hoạt động tùy chọn đó thay vì phá vỡ lịch.
                Chỉ trả JSON hợp lệ, không markdown, không giải thích.
                """.formatted(toCompactJson(violations));

        return generateFromPrompt(retryPrompt);
    }

    public String toCompactJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private JsonNode generateFromPrompt(String prompt) {
        try {
            String raw = geminiService.generateJsonAnswer(prompt, "{}", ITINERARY_JSON_MAX_TOKENS);
            JsonNode parsed = parseJson(raw);

            if (isInvalidItineraryJson(parsed)) {
                raw = geminiService.generateJsonAnswer(
                        prompt
                                + "\n\nCHỈ TRẢ JSON HỢP LỆ. Root phải có trường days là mảng. Không markdown.",
                        "{}",
                        ITINERARY_JSON_MAX_TOKENS
                );
                parsed = parseJson(raw);
            }

            if (isInvalidItineraryJson(parsed)) {
                throw new ItineraryGenerationException(
                        "INVALID_AI_JSON",
                        "AI không trả về lịch trình đúng định dạng JSON sau khi thử lại."
                );
            }

            return parsed;
        } catch (ItineraryGenerationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ItineraryGenerationException(
                    "GEMINI_ERROR",
                    "AI tạm thời không tạo được lịch trình. Vui lòng thử lại sau."
            );
        }
    }

    private boolean isInvalidItineraryJson(JsonNode node) {
        return node == null
                || !node.has("days")
                || !node.path("days").isArray();
    }

    private JsonNode parseJson(String raw) {
        try {
            return normalizeItineraryJson(objectMapper.readTree(extractJson(raw)));
        } catch (Exception exception) {
            return null;
        }
    }

    private JsonNode normalizeItineraryJson(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) return null;
        if (node.has("days") && node.path("days").isArray()) return node;

        JsonNode itinerary = node.path("itinerary");
        if (itinerary.has("days") && itinerary.path("days").isArray()) return itinerary;

        JsonNode plan = node.path("plan");
        if (plan.has("days") && plan.path("days").isArray()) return plan;

        JsonNode schedule = node.path("schedule");
        if (schedule.isArray()) {
            ObjectNode normalized = objectMapper.createObjectNode();
            normalized.put("itineraryTitle", node.path("itineraryTitle").asText("Lịch trình chuyến đi"));
            normalized.put("summary", node.path("summary").asText(""));
            normalized.set("days", schedule);
            return normalized;
        }

        if (node.isArray()) {
            ObjectNode normalized = objectMapper.createObjectNode();
            normalized.put("itineraryTitle", "Lịch trình chuyến đi");
            normalized.put("summary", "");
            normalized.set("days", node);
            return normalized;
        }

        return node;
    }

    private String extractJson(String raw) {
        if (raw == null) return "{}";

        String cleaned = raw
                .replace("\uFEFF", "")
                .replace("```json", "")
                .replace("```JSON", "")
                .replace("```", "")
                .trim();

        cleaned = cleaned.replaceAll(
                "[\\p{Cntrl}&&[^\r\n\t]]",
                ""
        );

        int start = cleaned.indexOf('{');
        if (start < 0) return cleaned;

        int end = findMatchingClosingBrace(cleaned, start);
        if (end > start) {
            return cleaned.substring(start, end + 1);
        }

        int last = cleaned.lastIndexOf('}');
        return last > start
                ? cleaned.substring(start, last + 1)
                : cleaned;
    }

    private int findMatchingClosingBrace(String text, int start) {
        int depth = 0;
        boolean inString = false;
        boolean escaped = false;

        for (int index = start; index < text.length(); index++) {
            char ch = text.charAt(index);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (ch == '\\') {
                escaped = true;
                continue;
            }

            if (ch == '"') {
                inString = !inString;
                continue;
            }

            if (inString) continue;

            if (ch == '{') depth++;
            if (ch == '}') {
                depth--;
                if (depth == 0) return index;
            }
        }

        return -1;
    }

    private String buildPrompt(
            AiItineraryGenerateRequest request,
            List<ActivitySuggestionResponse> activities,
            Map<String, Object> selectedHomestay,
            String itineraryCode,
            PlanningConstraints constraints
    ) {
        String requestJson = toCompactJson(request);
        String activitiesJson = toCompactJson(activities == null ? List.of() : activities);
        String homestayJson = toCompactJson(selectedHomestay == null ? Map.of() : selectedHomestay);
        String customPlacesJson = toCompactJson(
                request.getCustomPlaces() == null
                        ? List.<CustomPlaceRequest>of()
                        : request.getCustomPlaces()
        );
        String constraintJson = toCompactJson(
                constraints == null
                        ? Map.of()
                        : constraints.asPromptPayload()
        );

        return """
                Bạn là AI lập lịch du lịch của Cozygo.
                CHỈ trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON.
                Tất cả nội dung hiển thị cho người dùng phải bằng tiếng Việt.

                NGUYÊN TẮC QUAN TRỌNG:
                1. Backend đã tính ràng buộc TRƯỚC khi gọi AI. Hãy tuân thủ precomputedConstraints tuyệt đối.
                2. lockedSelectedActivities là các hoạt động khách đã chọn và backend đã tìm được khung giờ hợp lệ.
                   - Phải xuất hiện đầy đủ.
                   - Giữ nguyên dayNumber, startTime, endTime, durationMinutes và activityId.
                   - sourceType = SYSTEM_ACTIVITY, sourceId = activityId.
                3. lockedCustomPlaces là địa điểm riêng có fixedTime=true.
                   - Phải xuất hiện đầy đủ và giữ nguyên ngày/giờ.
                   - sourceType = USER_CUSTOM, sourceId = null, fixedTime = true.
                4. Các địa điểm riêng khác trong requiredCustomPlaceTitles cũng phải xuất hiện, nhưng AI được chọn ngày/giờ nếu người dùng không khóa giờ.
                5. Hoạt động hệ thống KHÔNG bắt buộc chỉ được dùng khi activityId tồn tại trong systemActivities.
                   - Không tự bịa activityId/homeId.
                   - Phải nằm trong allowedStartFrom..allowedStartTo và kết thúc trước closingTime.
                6. recommendedDurationMinutes là THỜI LƯỢNG KHUYẾN NGHỊ, không phải luật tuyệt đối.
                   - Ưu tiên planningDurationMinutes do backend tính.
                   - Với hoạt động tùy chọn, có thể điều chỉnh nhẹ khi cần nhưng không được vượt giờ mở cửa.
                7. Không chồng thời gian trong cùng ngày.
                8. Các mục bình thường do AI xếp nằm trong normalDayStart..normalDayEnd.
                   Riêng USER_CUSTOM fixedTime=true được giữ đúng giờ người dùng kể cả ngoài khung này.
                9. Ngày 1 không được xếp mục AI trước firstDayEarliestStart.
                10. Giữa HAI ĐỊA ĐIỂM cần ít nhất travelBufferMinutes phút để di chuyển/nghỉ,
                    hoặc chèn một mục TRANSPORT có thời lượng phù hợp.
                11. Bữa ăn, nghỉ ngơi, free time là quy tắc MỀM để lịch tự nhiên, không được làm thay đổi các mục locked.
                    Gợi ý: sáng 06:30-09:30, trưa 10:30-13:30, tối 17:30-20:30.
                12. pace=SLOW: ít điểm hơn và nhiều nghỉ; MEDIUM: vừa phải; FAST: có thể nhiều điểm hơn nhưng không vi phạm ràng buộc cứng.
                13. Tạo đúng totalDays phần tử days. dayNumber phải từ 1 đến totalDays.
                14. Không tự tạo hoạt động hệ thống ngoài đúng city/province mà backend đã lọc.

                QUY TẮC SOURCE:
                - SYSTEM_ACTIVITY: activityId/sourceId phải là ID thật trong systemActivities.
                - HOMESTAY: sourceId là homeId thật của selectedHomestay.
                - USER_CUSTOM: sourceId = null.
                - MEAL, REST, TRANSPORT, FREE_TIME, AI_SUGGESTED: sourceId = null.
                - Database itinerary_items hiện chỉ lưu title và address, không có locationName/homestayId.
                  Không trả locationName hoặc homestayId trong JSON. Dùng title cho tên mục và address cho địa chỉ/khu vực.

                JSON SCHEMA BẮT BUỘC:
                {
                  "itineraryTitle": "string",
                  "summary": "string",
                  "days": [
                    {
                      "dayNumber": 1,
                      "items": [
                        {
                          "startTime": "08:00",
                          "endTime": "09:30",
                          "durationMinutes": 90,
                          "preferredTimeOfDay": "MORNING|AFTERNOON|EVENING|ANY",
                          "fixedTime": false,
                          "title": "string",
                          "address": "string|null",
                          "itemType": "ACTIVITY|HOMESTAY|MEAL|REST|TRANSPORT|FREE_TIME|CUSTOM",
                          "sourceType": "SYSTEM_ACTIVITY|HOMESTAY|USER_CUSTOM|MEAL|REST|TRANSPORT|FREE_TIME|AI_SUGGESTED",
                          "sourceId": null,
                          "activityId": null,
                          "latitude": null,
                          "longitude": null,
                          "estimatedCost": null,
                          "transportNote": "string|null",
                          "note": "string|null"
                        }
                      ]
                    }
                  ]
                }

                itineraryCode: %s
                userRequest: %s
                selectedHomestay: %s
                systemActivities: %s
                customPlaces: %s
                precomputedConstraints: %s
                """.formatted(
                itineraryCode,
                requestJson,
                homestayJson,
                activitiesJson,
                customPlacesJson,
                constraintJson
        );
    }
}
