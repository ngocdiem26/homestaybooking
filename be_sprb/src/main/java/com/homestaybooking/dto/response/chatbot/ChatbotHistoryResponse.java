package com.homestaybooking.dto.response.chatbot;

import java.time.LocalDateTime;
import java.util.List;

public record ChatbotHistoryResponse(
        boolean authenticated,
        Integer currentSessionId,
        List<SessionHistory> sessions,
        boolean hasMore
) {
    public static ChatbotHistoryResponse guest() {
        return new ChatbotHistoryResponse(false, null, List.of(), false);
    }

    public record SessionHistory(
            Integer sessionId,
            String sessionTitle,
            String sessionStatus,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            LocalDateTime lastActivityAt,
            boolean continuable,
            List<MessageHistory> messages
    ) {
    }

    public record MessageHistory(
            Integer messageId,
            String senderType,
            String messageContent,
            String intent,
            String dataType,
            Object data,
            LocalDateTime createdAt
    ) {
    }
}
