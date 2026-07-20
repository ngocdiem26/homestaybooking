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

    public ChatResponse handleMessage(ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Message content must not be blank.");
        }

        ChatSession session = getOrCreateSessionSafely(request);
        Integer sessionId = session == null ? request.getSessionId() : session.getSessionId();
        String userMessage = request.getMessage().trim();
        String intent = intentDetectionService.detectIntent(userMessage);

        saveMessage(sessionId, "USER", userMessage, intent, null);

        ChatResponse response = switch (intent) {
            case "SEARCH_HOMESTAY" -> handleHomestaySearch(sessionId, userMessage, intent);
            case "PROMOTION_LOOKUP" -> handlePromotionLookup(sessionId, userMessage, intent);
            case "DESTINATION_SUGGESTION" -> handleDestinationSuggestion(sessionId, userMessage, intent);
            case "ACTIVITY_SUGGESTION" -> handleActivitySuggestion(sessionId, userMessage, intent);
            case "BOOKING_STATUS" -> handleLoginRequired(sessionId, intent);
            case "BOOKING_GUIDE", "VNPAY_GUIDE", "PAY_AT_PROPERTY_GUIDE", "COMPLAINT_GUIDE",
                    "CANCELLATION_GUIDE", "REVIEW_GUIDE", "HOST_REGISTER_GUIDE", "CONTACT_GUIDE" ->
                    handleStaticGuide(sessionId, intent);
            default -> handleRagAnswer(sessionId, userMessage, intent);
        };

        saveMessage(
                sessionId,
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
                List.of("Hướng dẫn đặt phòng", "Tìm homestay giá rẻ", "Thanh toán VNPay là gì?")
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
            Tôi có thể hỗ trợ bạn tìm homestay, hướng dẫn đặt phòng, thanh toán VNPay, thanh toán tại chỗ, mã khuyến mãi và khiếu nại. Bạn muốn tôi hỗ trợ nội dung nào?
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
                List.of("Tìm homestay ở Đà Lạt", "Thanh toán VNPay là gì?", "Tôi muốn khiếu nại")
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

    private ChatResponse handleStaticGuide(Integer sessionId, String intent) {
        return switch (intent) {
            case "BOOKING_GUIDE" -> buildResponse(
                    sessionId,
                    "Quy trình đặt phòng gồm 4 bước: chọn homestay, chọn ngày nhận/trả phòng và số khách, kiểm tra giá kèm dịch vụ/mã khuyến mãi, sau đó chọn phương thức thanh toán và gửi yêu cầu. Chủ homestay sẽ xác nhận đơn trước khi bạn lưu trú.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Tìm homestay ở Đà Lạt", "Có mã giảm giá nào không?", "Thanh toán VNPay là gì?")
            );
            case "VNPAY_GUIDE" -> buildResponse(
                    sessionId,
                    "VNPay là phương thức thanh toán VNPay. Khi chọn VNPay, hệ thống tạo thông tin thanh toán cho đơn. Sau khi giao dịch được ghi nhận, trạng thái thanh toán chuyển sang đã thanh toán và đơn chờ chủ homestay xác nhận.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Thanh toán tại chỗ là gì?", "Hướng dẫn đặt phòng", "Tôi muốn khiếu nại booking")
            );
            case "PAY_AT_PROPERTY_GUIDE" -> buildResponse(
                    sessionId,
                    "Thanh toán tại chỗ nghĩa là bạn gửi yêu cầu đặt phòng trước, sau đó thanh toán trực tiếp khi nhận phòng theo quy định của homestay. Chủ homestay có thể xác nhận thanh toán trong trang quản lý đơn.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Hướng dẫn đặt phòng", "Thanh toán VNPay là gì?", "Xem đơn đặt phòng của tôi")
            );
            case "COMPLAINT_GUIDE" -> buildResponse(
                    sessionId,
                    "Bạn có thể gửi khiếu nại trong trang cá nhân, mục Đơn đặt phòng của bạn. Mở chi tiết đơn đã hoàn thành, chọn Viết khiếu nại, nhập tiêu đề và nội dung. Admin sẽ xử lý và phản hồi qua email; trạng thái được theo dõi tại mục Khiếu nại của tôi.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Vào trang cá nhân", "Hướng dẫn đặt phòng", "Liên hệ hỗ trợ")
            );
            case "CANCELLATION_GUIDE" -> buildResponse(
                    sessionId,
                    "Nếu đơn còn trong trạng thái cho phép, bạn có thể mở chi tiết đơn trong trang cá nhân và chọn yêu cầu hủy. Các khoản hoàn/không hoàn phụ thuộc chính sách của homestay và phương thức thanh toán.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Xem đơn đặt phòng của tôi", "Tôi muốn khiếu nại booking", "Liên hệ hỗ trợ")
            );
            case "REVIEW_GUIDE" -> buildResponse(
                    sessionId,
                    "Chỉ khách có đơn đã hoàn thành mới được đánh giá homestay. Trong mục Đơn đặt phòng của bạn, đơn hoàn thành chưa đánh giá sẽ có nút Đánh giá. Mỗi đơn chỉ đánh giá một lần, sau đó bạn có thể xem hoặc sửa đánh giá trong mục Đánh giá của tôi.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Xem đánh giá của tôi", "Tìm homestay", "Tôi muốn khiếu nại booking")
            );
            case "HOST_REGISTER_GUIDE" -> buildResponse(
                    sessionId,
                    "Nếu muốn hợp tác làm chủ homestay, bạn đăng ký tài khoản với vai trò Chủ nhà, sau đó vào khu vực Host để thêm homestay, ảnh, tiện nghi, dịch vụ và nội quy. Homestay cần được admin duyệt trước khi hiển thị cho khách.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Đăng ký", "Quản lý homestay gồm gì?", "Liên hệ hỗ trợ")
            );
            default -> buildResponse(
                    sessionId,
                    "Bạn có thể liên hệ Cozygo qua mục Hợp tác hoặc gửi khiếu nại từ trang cá nhân nếu vấn đề liên quan đến đơn đặt phòng. Khi cần hỗ trợ nhanh, hãy cung cấp mã đơn để nhân sự kiểm tra chính xác hơn.",
                    intent,
                    "TEXT",
                    null,
                    List.of("Tôi muốn khiếu nại booking", "Hướng dẫn đặt phòng", "Có mã giảm giá nào không?")
            );
        };
    }

    private ChatSession getOrCreateSessionSafely(ChatRequest request) {
        try {
            return getOrCreateSession(request);
        } catch (Exception exception) {
            return null;
        }
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
        if (sessionId == null) {
            return;
        }

        try {
            ChatMessage message = new ChatMessage();
            message.setSessionId(sessionId);
            message.setSenderType(senderType);
            message.setMessageContent(content);
            message.setIntent(intent);
            message.setMetadata(metadata);
            chatMessageRepository.save(message);
        } catch (Exception ignored) {
            // Chat history is useful for analytics, but it must not break the assistant response.
        }
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