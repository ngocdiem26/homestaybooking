package com.homestaybooking.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.request.chatbot.ChatRequest;
import com.homestaybooking.dto.response.chatbot.ChatResponse;
import com.homestaybooking.entity.ChatMessage;
import com.homestaybooking.entity.ChatSession;
import com.homestaybooking.repository.ChatMessageRepository;
import com.homestaybooking.repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final IntentDetectionService intentDetectionService;
    private final ChatbotToolService toolService;
    private final ChatbotRagService ragService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatbotService(
            ChatSessionRepository chatSessionRepository,
            ChatMessageRepository chatMessageRepository,
            IntentDetectionService intentDetectionService,
            ChatbotToolService toolService,
            ChatbotRagService ragService,
            GeminiService geminiService
    ) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.intentDetectionService = intentDetectionService;
        this.toolService = toolService;
        this.ragService = ragService;
        this.geminiService = geminiService;
    }

    @Transactional
    public ChatResponse handleMessage(ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống.");
        }

        ChatSession session = getOrCreateSession(request);
        String userMessage = request.getMessage().trim();
        String intent = intentDetectionService.detectIntent(userMessage);

        saveMessage(session.getSessionId(), "USER", userMessage, intent, null);

        ChatResponse response = switch (intent) {
            case "SEARCH_HOMESTAY" -> handleHomestaySearch(session.getSessionId(), userMessage, intent);
            case "PROMOTION_LOOKUP" -> handlePromotionLookup(session.getSessionId(), userMessage, intent);
            case "DESTINATION_SUGGESTION" -> handleDestinationSuggestion(session.getSessionId(), userMessage, intent);
            case "ACTIVITY_SUGGESTION" -> handleActivitySuggestion(session.getSessionId(), userMessage, intent);
            case "BOOKING_STATUS" -> handleLoginRequired(session.getSessionId(), intent);
            default -> handleRagAnswer(session.getSessionId(), userMessage, intent);
        };

        saveMessage(
                session.getSessionId(),
                "BOT",
                response.getAnswer(),
                intent,
                toJson(response.getData())
        );

        return response;
    }

    private ChatResponse handleHomestaySearch(Integer sessionId, String userMessage, String intent) {
        List<Map<String, Object>> homestays = toolService.searchHomestays(userMessage);

        String fallback = homestays.isEmpty()
                ? "Hiện tôi chưa tìm thấy homestay phù hợp. Bạn có muốn tôi tìm với ngân sách cao hơn hoặc khu vực khác không?"
                : "Tôi tìm thấy " + homestays.size() + " homestay phù hợp. Bạn có thể bấm vào từng card để xem chi tiết.";

        String prompt = """
            Bạn là chatbot tư vấn của website HomestayBooking.
            Chỉ dùng dữ liệu homestay bên dưới, không bịa thêm giá hoặc tên homestay.
            Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.

            Người dùng hỏi:
            %s

            Dữ liệu homestay:
            %s
        """.formatted(userMessage, toJson(homestays));

        String answer = geminiService.generateAnswer(prompt, fallback);

        return buildResponse(
                sessionId,
                answer,
                intent,
                "HOMESTAY_LIST",
                homestays,
                List.of("Tìm homestay dưới 1 triệu", "Có homestay cho 4 người không?", "Hướng dẫn đặt phòng")
        );
    }

    private ChatResponse handlePromotionLookup(Integer sessionId, String userMessage, String intent) {
        List<Map<String, Object>> promotions = toolService.getActivePromotions();

        String fallback = promotions.isEmpty()
                ? "Hiện chưa có mã khuyến mãi khả dụng."
                : "Hiện có một số mã khuyến mãi đang hoạt động. Bạn có thể dùng ở bước xác nhận đặt phòng.";

        String prompt = """
            Bạn là chatbot HomestayBooking.
            Hãy giải thích ngắn gọn các mã khuyến mãi đang có.
            Không bịa mã khuyến mãi ngoài dữ liệu.

            Câu hỏi:
            %s

            Dữ liệu mã khuyến mãi:
            %s
        """.formatted(userMessage, toJson(promotions));

        String answer = geminiService.generateAnswer(prompt, fallback);

        return buildResponse(
                sessionId,
                answer,
                intent,
                "PROMOTION_LIST",
                promotions,
                List.of("Hướng dẫn đặt phòng", "Tìm homestay giá rẻ", "Thanh toán SePay là gì?")
        );
    }

    private ChatResponse handleDestinationSuggestion(Integer sessionId, String userMessage, String intent) {
        List<Map<String, Object>> destinations = toolService.getDestinations();

        String fallback = destinations.isEmpty()
                ? "Hiện tôi chưa có dữ liệu địa điểm khám phá."
                : "Tôi gợi ý một số địa điểm khám phá nổi bật. Bạn có thể chọn một địa điểm để xem homestay gần đó.";

        String prompt = """
            Bạn là chatbot tư vấn du lịch của HomestayBooking.
            Hãy giới thiệu ngắn gọn các địa điểm dựa trên dữ liệu.
            Không bịa địa điểm ngoài dữ liệu.

            Câu hỏi:
            %s

            Dữ liệu địa điểm:
            %s
        """.formatted(userMessage, toJson(destinations));

        String answer = geminiService.generateAnswer(prompt, fallback);

        return buildResponse(
                sessionId,
                answer,
                intent,
                "DESTINATION_LIST",
                destinations,
                List.of("Tìm homestay ở Đà Lạt", "Có hoạt động trải nghiệm nào không?", "Tìm homestay gần biển")
        );
    }

    private ChatResponse handleActivitySuggestion(Integer sessionId, String userMessage, String intent) {
        List<Map<String, Object>> activities = toolService.getActivities(userMessage);

        String fallback = activities.isEmpty()
                ? "Hiện tôi chưa tìm thấy hoạt động trải nghiệm phù hợp với khu vực này."
                : "Tôi tìm thấy một số hoạt động trải nghiệm nổi bật. Bạn có thể xem homestay gần nơi diễn ra hoạt động.";

        String prompt = """
            Bạn là chatbot tư vấn trải nghiệm địa phương của HomestayBooking.
            Giới thiệu hoạt động dựa trên dữ liệu, không bịa giá hoặc lịch trình.

            Câu hỏi:
            %s

            Dữ liệu hoạt động:
            %s
        """.formatted(userMessage, toJson(activities));

        String answer = geminiService.generateAnswer(prompt, fallback);

        return buildResponse(
                sessionId,
                answer,
                intent,
                "ACTIVITY_LIST",
                activities,
                List.of("Tìm homestay gần hoạt động này", "Gợi ý địa điểm khám phá", "Tìm homestay ở Đà Lạt")
        );
    }

    private ChatResponse handleRagAnswer(Integer sessionId, String userMessage, String intent) {
        String context = ragService.retrieveContext(userMessage);

        String fallback = """
            Tôi có thể hỗ trợ bạn tìm homestay, hướng dẫn đặt phòng, thanh toán SePay, thanh toán tại chỗ, mã khuyến mãi và khiếu nại. Bạn muốn tôi hỗ trợ nội dung nào?
        """;

        String prompt = """
            Bạn là chatbot hỗ trợ của website đặt homestay HomestayBooking.

            Quy tắc:
            - Luôn trả lời bằng tiếng Việt.
            - Chỉ dựa trên dữ liệu hệ thống cung cấp.
            - Nếu không đủ thông tin, hãy hỏi lại.
            - Không bịa giá, trạng thái booking, mã khuyến mãi.
            - Không yêu cầu mật khẩu, OTP hoặc thông tin ngân hàng nhạy cảm.

            Câu hỏi người dùng:
            %s

            Ngữ cảnh RAG:
            %s
        """.formatted(userMessage, context);

        String answer = geminiService.generateAnswer(prompt, fallback);

        return buildResponse(
                sessionId,
                answer,
                intent,
                "TEXT",
                null,
                List.of("Tìm homestay ở Đà Lạt", "Thanh toán SePay là gì?", "Tôi muốn khiếu nại")
        );
    }

    private ChatResponse handleLoginRequired(Integer sessionId, String intent) {
        return buildResponse(
                sessionId,
                "Để kiểm tra trạng thái booking của bạn, bạn cần đăng nhập trước. Sau khi đăng nhập, hãy vào mục Đặt phòng của tôi hoặc gửi mã booking để tôi hỗ trợ.",
                intent,
                "LOGIN_REQUIRED",
                null,
                List.of("Đăng nhập", "Hướng dẫn đặt phòng", "Tôi muốn khiếu nại")
        );
    }

    private ChatSession getOrCreateSession(ChatRequest request) {
        if (request.getSessionId() != null) {
            return chatSessionRepository.findById(request.getSessionId())
                    .orElseGet(() -> createSession(request.getMessage()));
        }

        return createSession(request.getMessage());
    }

    private ChatSession createSession(String firstMessage) {
        ChatSession session = new ChatSession();
        session.setUserId(null);
        session.setSessionStatus("ACTIVE");

        String title = firstMessage == null || firstMessage.isBlank()
                ? "Cuộc trò chuyện mới"
                : firstMessage.trim();

        if (title.length() > 100) {
            title = title.substring(0, 100);
        }

        session.setSessionTitle(title);

        return chatSessionRepository.save(session);
    }

    private void saveMessage(Integer sessionId, String senderType, String content, String intent, String metadata) {
        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setSenderType(senderType);
        message.setMessageContent(content);
        message.setIntent(intent);
        message.setMetadata(metadata);
        chatMessageRepository.save(message);
    }

    private ChatResponse buildResponse(
            Integer sessionId,
            String answer,
            String intent,
            String dataType,
            Object data,
            List<String> suggestions
    ) {
        ChatResponse response = new ChatResponse();
        response.setSessionId(sessionId);
        response.setAnswer(answer);
        response.setIntent(intent);
        response.setDataType(dataType);
        response.setData(data);
        response.setSuggestions(suggestions);
        return response;
    }

    private String toJson(Object value) {
        try {
            if (value == null) return null;
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            return String.valueOf(value);
        }
    }
}