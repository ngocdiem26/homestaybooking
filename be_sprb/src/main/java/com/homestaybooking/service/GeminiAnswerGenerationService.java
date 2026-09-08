package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import com.homestaybooking.dto.response.chatbot.ChatbotRetrievalResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiAnswerGenerationService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public String generate(
            String userMessage,
            ChatbotIntentAnalysis analysis,
            ChatbotRetrievalResult retrieval
    ) {
        if (retrieval == null) {
            return "Hiện tại trợ lý AI đang bận, bạn có thể thử lại sau.";
        }

        String dataType = retrieval.getDataType() == null
                ? "TEXT"
                : retrieval.getDataType();

        if ("LOGIN_REQUIRED".equals(dataType)) {
            return "Bạn cần đăng nhập để mình kiểm tra các thông tin cá nhân như đơn đặt phòng, yêu thích, khiếu nại hoặc hạng thành viên.";
        }

        if ("CLARIFICATION".equals(dataType)) {
            Object question = retrieval.getData() instanceof Map<?, ?> map
                    ? map.get("question")
                    : null;

            return question == null
                    ? "Bạn cho mình thêm một chút thông tin để hỗ trợ chính xác hơn nhé."
                    : String.valueOf(question);
        }

        if ("ERROR".equals(dataType)) {
            return "Hiện tại trợ lý AI đang bận, bạn có thể thử lại sau.";
        }

        /*
         * RAG fallback quan trọng:
         * Nếu backend đã tìm được document/chunk nhưng Gemini generation lỗi,
         * vẫn trả chính nội dung RAG thay vì câu chung chung
         * "Mình đã tra cứu dữ liệu Cozygo...".
         */
        String fallback = knowledgeFallback(retrieval);

        if (fallback == null || fallback.isBlank()) {
            fallback = fallbackAnswer(dataType, retrieval);
        }

        String prompt = """
                Bạn là chatbot của website Cozygo Homestay Booking.
                Nhiệm vụ: trả lời khách bằng tiếng Việt tự nhiên, đầy đủ nhưng không dài dòng.

                Quy tắc bắt buộc:
                - Chỉ trả lời dựa trên DỮ LIỆU HỆ THỐNG được backend cung cấp.
                - Không bịa homestay, giá, khuyến mãi, hoạt động, chính sách hoặc tình trạng phòng.
                - Nếu dữ liệu không có, nói rõ là hiện chưa có dữ liệu phù hợp.
                - Với câu hỏi chính sách/hướng dẫn/quy trình: phải nêu đầy đủ điều kiện, cách thực hiện và lưu ý quan trọng nếu dữ liệu có cung cấp.
                - Không được chỉ trả một câu chung chung như "đã tra cứu dữ liệu" khi context đã có nội dung cụ thể.
                - Khi gợi ý homestay, nêu lý do phù hợp với nhu cầu người dùng.
                - Nếu thiếu ngày nhận/trả phòng để kiểm tra lịch trống, nhắc khách bổ sung ngày đi.
                - Nếu intent là TRIP_PLANNING hoặc ITINERARY_GENERATION, không tự tạo lịch trình trong chatbot; chỉ hướng người dùng sang chức năng Tạo lịch trình AI riêng khi backend cung cấp thông tin đó.
                - Không hiển thị SQL, stacktrace, API key, internal ID kỹ thuật hoặc dữ liệu nhạy cảm.
                - Câu trả lời phải trọn vẹn, không được dừng giữa câu, giữa ý hoặc giữa danh sách.
                - Không thêm điều kiện/chính sách không có trong context.

                CÂU HỎI NGƯỜI DÙNG:
                %s

                PHÂN TÍCH INTENT:
                %s

                DỮ LIỆU HỆ THỐNG ĐÃ TRUY XUẤT:
                %s

                Hãy viết câu trả lời cuối cùng cho người dùng.
                """.formatted(
                userMessage,
                toJson(analysis),
                retrieval.getContextText()
        );

        return geminiService.generateAnswer(prompt, fallback);
    }

    /**
     * Chỉ dùng cho retrieval được tạo từ guide/RAG.
     * `ChatbotDataRetrievalService.guide()` luôn đặt `context` trong data.
     */
    private String knowledgeFallback(ChatbotRetrievalResult retrieval) {
        if (!(retrieval.getData() instanceof Map<?, ?> map)) {
            return "";
        }

        if (!map.containsKey("context")) {
            return "";
        }

        Object contextValue = map.get("context");
        if (contextValue == null) {
            return "";
        }

        String context = String.valueOf(contextValue).trim();
        if (context.isBlank()) {
            return "";
        }

        boolean knowledgeFound = true;
        Object foundValue = map.get("knowledgeFound");

        if (foundValue instanceof Boolean value) {
            knowledgeFound = value;
        }

        if (!knowledgeFound) {
            return context;
        }

        String cleaned = cleanRagContextForUser(context);
        if (cleaned.isBlank()) {
            return context;
        }

        return "Theo thông tin hiện có của Cozygo:\n" + cleaned;
    }

    private String cleanRagContextForUser(String context) {
        if (context == null || context.isBlank()) {
            return "";
        }

        StringBuilder result = new StringBuilder();

        for (String line : context.split("\\R")) {
            String trimmed = line.trim();

            if (trimmed.isBlank()) {
                if (!result.isEmpty()
                        && result.charAt(result.length() - 1) != '\n') {
                    result.append('\n');
                }
                continue;
            }

            // Không cần show metadata kỹ thuật của RAG cho khách.
            if (trimmed.startsWith("Nguồn:")) {
                continue;
            }

            if (!result.isEmpty()
                    && result.charAt(result.length() - 1) != '\n') {
                result.append(' ');
            }

            result.append(trimmed);
        }

        return result.toString()
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String fallbackAnswer(
            String dataType,
            ChatbotRetrievalResult retrieval
    ) {
        Object data = retrieval.getData();

        if ("HOMESTAY_LIST".equals(dataType)) {
            List<?> homestays = listFrom(data, "homestays");

            if (!homestays.isEmpty()) {
                return "Mình tìm thấy một số homestay phù hợp với nhu cầu của bạn. Bạn xem các gợi ý bên dưới nhé.";
            }

            return "Hiện chưa có homestay phù hợp với điều kiện này. Bạn có thể thử nới giá, đổi khu vực hoặc giảm bớt tiện nghi bắt buộc.";
        }

        if ("PROMOTION_LIST".equals(dataType)) {
            List<?> promotions = listFrom(data, "promotions");

            if (!promotions.isEmpty()) {
                return "Cozygo đang có một số mã khuyến mãi có thể tham khảo. Bạn xem danh sách bên dưới nhé.";
            }

            return "Hiện chưa có mã khuyến mãi công khai phù hợp.";
        }

        if ("ACTIVITY_LIST".equals(dataType)) {
            List<?> activities = listFrom(data, "activities");

            return activities.isEmpty()
                    ? "Hiện chưa có hoạt động trải nghiệm phù hợp trong dữ liệu Cozygo."
                    : "Mình tìm thấy một số hoạt động trải nghiệm phù hợp trong hệ thống Cozygo.";
        }

        if ("DESTINATION_LIST".equals(dataType)) {
            return "Đây là một số điểm đến đang có trong hệ thống Cozygo.";
        }

        if ("BOOKING_STATUS".equals(dataType)) {
            return "Mình đã tìm thấy thông tin đơn đặt phòng của bạn trong hệ thống.";
        }

        return "Hiện mình chưa có đủ dữ liệu cụ thể để trả lời câu hỏi này.";
    }

    private List<?> listFrom(Object data, String key) {
        if (data instanceof Map<?, ?> map
                && map.get(key) instanceof List<?> list) {
            return list;
        }

        return List.of();
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return String.valueOf(value);
        }
    }
}
