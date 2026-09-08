package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.request.chatbot.ChatRequest;
import com.homestaybooking.dto.response.chatbot.ChatResponse;
import com.homestaybooking.dto.response.chatbot.ChatbotHistoryResponse;
import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import com.homestaybooking.dto.response.chatbot.ChatbotRetrievalResult;
import com.homestaybooking.entity.ChatMessage;
import com.homestaybooking.entity.ChatSession;
import com.homestaybooking.entity.User;
import com.homestaybooking.repository.ChatMessageRepository;
import com.homestaybooking.repository.ChatSessionRepository;
import com.homestaybooking.repository.UserRepository;
import com.homestaybooking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private static final double MIN_CONFIDENCE = 0.55;

    /*
     * Một session chỉ được dùng làm ngữ cảnh AI khi người dùng còn tương tác gần đây.
     * Đóng/mở lại chatbot trong <= 30 phút vẫn tiếp tục session cũ.
     * Sau 30 phút, tin nhắn tiếp theo sẽ bắt đầu một session mới và context cũ không được mang sang.
     */
    private static final int SESSION_IDLE_TIMEOUT_MINUTES = 30;
    private static final int DEFAULT_HISTORY_SESSION_LIMIT = 5;
    private static final int MAX_HISTORY_SESSION_LIMIT = 10;

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatbotConversationContextService conversationContextService;
    private final ChatbotIntentService intentService;
    private final ChatbotDataRetrievalService dataRetrievalService;
    private final GeminiAnswerGenerationService answerGenerationService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ChatResponse handleMessage(ChatRequest request) {
        return handleMessage(request, null);
    }

    /*
     * Không giữ một transaction DB mở trong lúc gọi Gemini/Embedding API.
     * Các repository save() tự quản lý transaction ngắn của chúng.
     */
    public ChatResponse handleMessage(ChatRequest request, String authorizationHeader) {
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống.");
        }

        String userMessage = request.getMessage().trim();
        Integer userId = resolveUserId(authorizationHeader);
        ChatSession session = getOrCreateSession(request, userId);
        Integer sessionId = session.getSessionId();

        /*
         * Chỉ đọc lịch sử của SESSION HIỆN TẠI để làm context.
         * Các session cũ chỉ dùng để hiển thị lịch sử trên giao diện, không được đưa vào prompt AI.
         */
        ChatbotConversationContextService.ConversationContext context = conversationContextService.load(sessionId);
        ChatbotIntentAnalysis analysis = intentService.analyze(
                userMessage,
                context.previousAnalysis(),
                context.transcript()
        );

        saveMessage(
                sessionId,
                "USER",
                userMessage,
                analysis.getPrimaryIntent(),
                toJson(Map.of(
                        "page", safe(request.getCurrentPage()),
                        "userId", userId == null ? "" : userId
                ))
        );

        ChatbotRetrievalResult retrieval = needsClarification(analysis)
                ? clarificationResult(analysis)
                : dataRetrievalService.retrieve(
                        analysis,
                        userMessage,
                        userId
                );

        String answer = answerGenerationService.generate(
                userMessage,
                analysis,
                retrieval
        );

        ChatResponse response = buildResponse(sessionId, answer, analysis, retrieval);
        saveMessage(
                sessionId,
                "BOT",
                answer,
                analysis.getPrimaryIntent(),
                toJson(Map.of(
                        "analysis", analysis,
                        "dataType", retrieval.getDataType(),
                        "data", retrieval.getData() == null ? Map.of() : retrieval.getData()
                ))
        );
        return response;
    }

    /**
     * Trả lịch sử theo từng session cho tài khoản đang đăng nhập.
     * Khách chưa đăng nhập nhận danh sách rỗng; frontend sẽ dùng localStorage cho khách.
     *
     * beforeSessionId được dùng khi người dùng kéo lên trên để tải thêm lịch sử cũ.
     */
    public ChatbotHistoryResponse getHistory(
            String authorizationHeader,
            Integer beforeSessionId,
            Integer requestedLimit
    ) {
        Integer userId = resolveUserId(authorizationHeader);
        if (userId == null) {
            return ChatbotHistoryResponse.guest();
        }

        int limit = requestedLimit == null ? DEFAULT_HISTORY_SESSION_LIMIT : requestedLimit;
        limit = Math.max(1, Math.min(limit, MAX_HISTORY_SESSION_LIMIT));

        List<ChatSession> fetched = new ArrayList<>(
                chatSessionRepository.findHistoryPage(
                        userId,
                        beforeSessionId,
                        PageRequest.of(0, limit + 1)
                )
        );

        boolean hasMore = fetched.size() > limit;
        if (hasMore) {
            fetched = new ArrayList<>(fetched.subList(0, limit));
        }

        Integer currentSessionId = null;
        if (beforeSessionId == null && !fetched.isEmpty()) {
            ChatSession newest = fetched.get(0);
            if (isContinuable(newest)) {
                currentSessionId = newest.getSessionId();
            } else {
                endIfExpired(newest);
            }
        }

        /*
         * Repository lấy mới -> cũ để pagination dễ dàng.
         * API trả cũ -> mới để frontend prepend/hiển thị timeline thuận tiện.
         */
        Collections.reverse(fetched);

        List<ChatbotHistoryResponse.SessionHistory> sessions = fetched.stream()
                .map(this::toSessionHistory)
                .toList();

        return new ChatbotHistoryResponse(
                true,
                currentSessionId,
                sessions,
                hasMore
        );
    }

    private ChatbotHistoryResponse.SessionHistory toSessionHistory(ChatSession session) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getSessionId());
        LocalDateTime lastActivityAt = lastActivityAt(session, messages);
        boolean continuable = isContinuable(session, lastActivityAt);

        List<ChatbotHistoryResponse.MessageHistory> mappedMessages = messages.stream()
                .map(this::toHistoryMessage)
                .toList();

        return new ChatbotHistoryResponse.SessionHistory(
                session.getSessionId(),
                session.getSessionTitle(),
                session.getSessionStatus(),
                session.getStartedAt(),
                session.getEndedAt(),
                lastActivityAt,
                continuable,
                mappedMessages
        );
    }

    private ChatbotHistoryResponse.MessageHistory toHistoryMessage(ChatMessage message) {
        HistoryMetadata metadata = parseHistoryMetadata(message.getMetadata());
        return new ChatbotHistoryResponse.MessageHistory(
                message.getMessageId(),
                message.getSenderType(),
                message.getMessageContent(),
                message.getIntent(),
                metadata.dataType(),
                metadata.data(),
                message.getCreatedAt()
        );
    }

    private HistoryMetadata parseHistoryMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return new HistoryMetadata("TEXT", null);
        }

        try {
            JsonNode root = objectMapper.readTree(metadataJson);
            String dataType = root.path("dataType").asText("TEXT");
            Object data = null;
            if (root.has("data") && !root.path("data").isNull()) {
                data = objectMapper.convertValue(root.path("data"), Object.class);
            }
            return new HistoryMetadata(dataType, data);
        } catch (Exception ignored) {
            return new HistoryMetadata("TEXT", null);
        }
    }

    private boolean needsClarification(ChatbotIntentAnalysis analysis) {
        if (analysis == null) return true;
        if (analysis.getClarification() != null
                && Boolean.TRUE.equals(analysis.getClarification().getNeedAskMore())) {
            return true;
        }
        return analysis.getConfidence() != null
                && analysis.getConfidence() < MIN_CONFIDENCE
                && (analysis.getPrimaryIntent() == null || "UNKNOWN".equalsIgnoreCase(analysis.getPrimaryIntent()));
    }

    private ChatbotRetrievalResult clarificationResult(ChatbotIntentAnalysis analysis) {
        String question = analysis != null
                && analysis.getClarification() != null
                && analysis.getClarification().getQuestion() != null
                ? analysis.getClarification().getQuestion()
                : "Bạn muốn mình hỗ trợ tìm homestay, khuyến mãi, hoạt động trải nghiệm hay hướng dẫn đặt phòng?";

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("question", question);
        data.put(
                "missingFields",
                analysis != null && analysis.getClarification() != null
                        ? analysis.getClarification().getMissingFields()
                        : List.of()
        );
        return new ChatbotRetrievalResult("CLARIFICATION", data, toJson(data), List.of());
    }

    private Integer resolveUserId(String authorizationHeader) {
        try {
            String email = jwtUtil.extractEmailFromAuthorizationHeader(authorizationHeader);
            if (email == null || email.isBlank()) return null;
            return userRepository.findByEmail(email).map(User::getUserId).orElse(null);
        } catch (Exception ignored) {
            return null;
        }
    }

    private ChatSession getOrCreateSession(ChatRequest request, Integer userId) {
        if (request.getSessionId() != null) {
            ChatSession existing = chatSessionRepository.findById(request.getSessionId()).orElse(null);

            if (existing != null) {
                Integer ownerId = existing.getUserId();

                /*
                 * Session ownership phải khớp tuyệt đối với trạng thái xác thực hiện tại.
                 *
                 * - User A không được tiếp tục session của User B.
                 * - User đã đăng nhập không được "claim" một guest session (ownerId = null).
                 * - Guest không được tiếp tục session của user đã đăng nhập.
                 *
                 * Trước đây ownerId == null && userId != null được gắn thẳng guest session
                 * vào tài khoản vừa login. Điều đó có thể làm lịch sử guest cũ xuất hiện trong
                 * tài khoản mới và làm ranh giới dữ liệu giữa các user không rõ ràng.
                 */
                if (!Objects.equals(ownerId, userId)) {
                    return createSession(request.getMessage(), userId);
                }

                if (isContinuable(existing)) {
                    return existing;
                }

                // Session đã quá thời gian im lặng: đóng session cũ và tạo context mới.
                if (ownerId == null || Objects.equals(ownerId, userId)) {
                    endIfExpired(existing);
                }
            }
        }

        return createSession(request.getMessage(), userId);
    }

    private boolean isContinuable(ChatSession session) {
        return isContinuable(session, lastActivityAt(session));
    }

    private boolean isContinuable(ChatSession session, LocalDateTime lastActivityAt) {
        if (!isActive(session) || lastActivityAt == null) return false;
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(SESSION_IDLE_TIMEOUT_MINUTES);
        return !lastActivityAt.isBefore(threshold);
    }

    private boolean isActive(ChatSession session) {
        if (session == null || session.getEndedAt() != null) return false;
        return session.getSessionStatus() == null
                || "ACTIVE".equalsIgnoreCase(session.getSessionStatus());
    }

    private LocalDateTime lastActivityAt(ChatSession session) {
        if (session == null || session.getSessionId() == null) return null;
        return chatMessageRepository.findTopBySessionIdOrderByCreatedAtDesc(session.getSessionId())
                .map(ChatMessage::getCreatedAt)
                .orElse(session.getStartedAt());
    }

    private LocalDateTime lastActivityAt(ChatSession session, List<ChatMessage> messages) {
        if (messages != null && !messages.isEmpty()) {
            ChatMessage latest = messages.get(messages.size() - 1);
            if (latest.getCreatedAt() != null) return latest.getCreatedAt();
        }
        return session == null ? null : session.getStartedAt();
    }

    private void endIfExpired(ChatSession session) {
        if (session == null || !isActive(session)) return;
        LocalDateTime lastActivity = lastActivityAt(session);
        if (lastActivity == null) return;

        LocalDateTime threshold = LocalDateTime.now().minusMinutes(SESSION_IDLE_TIMEOUT_MINUTES);
        if (lastActivity.isBefore(threshold)) {
            session.setSessionStatus("ENDED");
            session.setEndedAt(lastActivity);
            chatSessionRepository.save(session);
        }
    }

    private ChatSession createSession(String firstMessage, Integer userId) {
        ChatSession session = new ChatSession();
        session.setUserId(userId);
        session.setSessionStatus("ACTIVE");
        String title = firstMessage == null || firstMessage.isBlank()
                ? "Cuộc trò chuyện Cozygo"
                : firstMessage.trim();
        if (title.length() > 100) title = title.substring(0, 100);
        session.setSessionTitle(title);
        return chatSessionRepository.save(session);
    }

    private void saveMessage(
            Integer sessionId,
            String senderType,
            String content,
            String intent,
            String metadata
    ) {
        if (sessionId == null) return;
        try {
            ChatMessage message = new ChatMessage();
            message.setSessionId(sessionId);
            message.setSenderType(senderType);
            message.setMessageContent(content == null ? "" : content);
            message.setIntent(intent);
            message.setMetadata(metadata);
            chatMessageRepository.save(message);
        } catch (Exception ignored) {
            // Lỗi lưu lịch sử không được làm hỏng phản hồi chatbot.
        }
    }

    private ChatResponse buildResponse(
            Integer sessionId,
            String answer,
            ChatbotIntentAnalysis analysis,
            ChatbotRetrievalResult retrieval
    ) {
        ChatResponse response = new ChatResponse();
        response.setSessionId(sessionId);
        response.setAnswer(answer);
        response.setMessage(answer);
        response.setIntent(analysis == null ? "UNKNOWN" : analysis.getPrimaryIntent());
        response.setConfidence(analysis == null || analysis.getConfidence() == null ? 0.0 : analysis.getConfidence());
        response.setDataType(retrieval == null ? "TEXT" : retrieval.getDataType());
        response.setData(retrieval == null ? Map.of() : retrieval.getData());
        response.setSuggestions(
                retrieval == null || retrieval.getSuggestions() == null
                        ? List.of()
                        : retrieval.getSuggestions()
        );
        return response;
    }

    private String toJson(Object value) {
        try {
            if (value == null) return null;
            return objectMapper.writeValueAsString(value);
        } catch (Exception ignored) {
            return String.valueOf(value);
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

private record HistoryMetadata(String dataType, Object data) {
    }
}
