package com.homestaybooking.service;

import com.homestaybooking.dto.response.chatbot.ChatbotIntentAnalysis;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatbotIntentService {

    private final VietnameseChatbotRuleExtractor ruleExtractor;
    private final GeminiIntentParserService geminiIntentParserService;
    private final DestinationResolver destinationResolver;

    public ChatbotIntentAnalysis analyze(String message) {
        return analyze(message, null, "");
    }

    public ChatbotIntentAnalysis analyze(
            String message,
            ChatbotIntentAnalysis previousAnalysis,
            String conversationTranscript
    ) {
        ChatbotIntentAnalysis ruleBased = ruleExtractor.extract(message);

        ChatbotIntentAnalysis analysis = geminiIntentParserService.parse(
                message,
                ruleBased,
                previousAnalysis,
                conversationTranscript
        );

        canonicalizeDestinationFromDatabase(analysis);
        return analysis;
    }
    /**
     * Gemini chỉ giúp nhận ra cụm địa điểm. city/province cuối cùng phải lấy từ
     * bảng destinations nếu có bản ghi phù hợp. Nhờ vậy thêm điểm đến mới vào DB
     * không cần sửa Java.
     */
    private void canonicalizeDestinationFromDatabase(ChatbotIntentAnalysis analysis) {
        if (analysis == null || analysis.getEntities() == null) return;

        ChatbotIntentAnalysis.Entities entities = analysis.getEntities();
        DestinationResolver.ResolvedDestination resolved = destinationResolver.resolveDatabaseOnly(
                entities.getDestinationKeyword(),
                entities.getCity(),
                entities.getProvince()
        );

        if (resolved == null || !resolved.hasDestination()) return;

        // Ghi đè bằng giá trị canonical trong DB. Province-only thì city phải null
        // để không vô tình thu hẹp phạm vi tìm kiếm.
        entities.setCity(resolved.city());
        entities.setProvince(resolved.province());
        entities.setDestinationKeyword(
                resolved.city() != null && !resolved.city().isBlank()
                        ? resolved.city()
                        : resolved.province()
        );
    }
}
