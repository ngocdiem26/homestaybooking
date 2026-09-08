package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import com.homestaybooking.entity.ChatMessage;
import com.homestaybooking.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatbotConversationContextService {

    private static final int MAX_CONTEXT_CHARACTERS_PER_MESSAGE = 500;

    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    public ConversationContext load(Integer sessionId) {
        if (sessionId == null) {
            return ConversationContext.empty();
        }

        List<ChatMessage> latest = new ArrayList<>(
                chatMessageRepository.findTop12BySessionIdOrderByCreatedAtDesc(sessionId)
        );
        Collections.reverse(latest);

        StringBuilder transcript = new StringBuilder();
        ChatbotIntentAnalysis previousAnalysis = null;

        for (ChatMessage message : latest) {
            if (message == null) continue;

            String sender = "USER".equalsIgnoreCase(message.getSenderType()) ? "Người dùng" : "Cozygo";
            String content = limit(message.getMessageContent(), MAX_CONTEXT_CHARACTERS_PER_MESSAGE);
            if (content != null && !content.isBlank()) {
                transcript.append(sender).append(": ").append(content).append('\n');
            }

            if ("BOT".equalsIgnoreCase(message.getSenderType())) {
                ChatbotIntentAnalysis parsed = parseAnalysis(message.getMetadata());
                if (parsed != null) {
                    previousAnalysis = parsed;
                }
            }
        }

        return new ConversationContext(transcript.toString().trim(), previousAnalysis);
    }

    private ChatbotIntentAnalysis parseAnalysis(String metadata) {
        if (metadata == null || metadata.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(metadata);
            JsonNode analysis = root.path("analysis");
            if (analysis.isMissingNode() || analysis.isNull() || !analysis.isObject()) return null;
            return objectMapper.treeToValue(analysis, ChatbotIntentAnalysis.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    public record ConversationContext(
            String transcript,
            ChatbotIntentAnalysis previousAnalysis
    ) {
        public static ConversationContext empty() {
            return new ConversationContext("", null);
        }
    }
}
