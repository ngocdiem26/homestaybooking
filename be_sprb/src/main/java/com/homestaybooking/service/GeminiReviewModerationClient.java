package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.ReviewModerationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class GeminiReviewModerationClient {
    private static final String AI_ERROR = "__AI_MODERATION_ERROR__";
    private static final String AI_FALLBACK_NOTE = "Không đọc được kết quả AI, hệ thống đã dùng rule-based fallback.";

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.review.api.key:}")
    private String apiKey;

    @Value("${gemini.review.model:gemini-2.5-flash}")
    private String modelName;

    public ReviewModerationResult moderate(Integer rating, String comment) {
        String prompt = buildPrompt(rating, comment);
        String raw = geminiService.generateJsonAnswerWithConfig(prompt, AI_ERROR, apiKey, modelName);
        if (AI_ERROR.equals(raw)) {
            return aiError("Gemini không phản hồi hoặc API chưa sẵn sàng.", null);
        }
        try {
            String json = extractJson(raw);
            JsonNode node = objectMapper.readTree(json);
            BigDecimal toxicity = score(node, "toxicityScore");
            BigDecimal profanity = score(node, "profanityScore");
            BigDecimal insult = score(node, "insultScore");
            BigDecimal threat = score(node, "threatScore");
            BigDecimal hate = score(node, "hateScore");
            BigDecimal death = score(node, "deathRelatedScore");
            BigDecimal spam = score(node, "spamScore");
            BigDecimal privacy = score(node, "privacyScore");
            BigDecimal finalScore = max(toxicity, profanity, insult, threat, hate, death, spam, privacy);
            String action = normalizeAction(node.path("action").asText("ALLOW"));
            boolean mismatch = node.path("ratingCommentMismatch").asBoolean(false);
            boolean severe = "HIDE".equals(action)
                    || threat.compareTo(BigDecimal.valueOf(0.70)) >= 0
                    || death.compareTo(BigDecimal.valueOf(0.70)) >= 0
                    || hate.compareTo(BigDecimal.valueOf(0.80)) >= 0
                    || privacy.compareTo(BigDecimal.valueOf(0.80)) >= 0
                    || toxicity.compareTo(BigDecimal.valueOf(0.90)) >= 0;
            boolean needsReview = severe || mismatch || "FLAG_FOR_REVIEW".equals(action) || finalScore.compareTo(BigDecimal.valueOf(0.40)) >= 0;
            if (severe) action = "HIDE";
            else if (needsReview) action = "FLAG_FOR_REVIEW";
            else action = "ALLOW";

            return ReviewModerationResult.builder()
                    .provider("GEMINI")
                    .modelName(modelName)
                    .moderationStatus(severe || needsReview ? "AI_FLAGGED" : "AI_SAFE")
                    .moderationAction(action)
                    .adminReviewStatus(needsReview ? "PENDING" : "NONE")
                    .moderationReason(node.path("reason").asText(action.equals("ALLOW") ? "Không phát hiện dấu hiệu vi phạm." : "AI đánh dấu đánh giá cần kiểm tra."))
                    .toxicityScore(toxicity)
                    .profanityScore(profanity)
                    .insultScore(insult)
                    .threatScore(threat)
                    .hateScore(hate)
                    .deathRelatedScore(death)
                    .spamScore(spam)
                    .privacyScore(privacy)
                    .finalScore(finalScore)
                    .sentiment(normalizeSentiment(node.path("sentiment").asText("NEUTRAL")))
                    .ratingCommentMismatch(mismatch)
                    .categories(node.path("categories").isMissingNode() ? "[\"SAFE\"]" : objectMapper.writeValueAsString(node.path("categories")))
                    .rawResponse(json)
                    .severeViolation(severe)
                    .needsAdminReview(needsReview)
                    .build();
        } catch (Exception exception) {
            return aiError("Gemini trả kết quả không phải JSON hợp lệ.", raw);
        }
    }

    private ReviewModerationResult aiError(String reason, String rawResponse) {
        return ReviewModerationResult.builder()
                .provider("RULE_BASED_FALLBACK")
                .modelName("gemini-error")
                .moderationStatus("AI_ERROR")
                .moderationAction("FLAG_FOR_REVIEW")
                .adminReviewStatus("PENDING")
                .moderationReason(AI_FALLBACK_NOTE)
                .toxicityScore(BigDecimal.ZERO.setScale(4))
                .profanityScore(BigDecimal.ZERO.setScale(4))
                .insultScore(BigDecimal.ZERO.setScale(4))
                .threatScore(BigDecimal.ZERO.setScale(4))
                .hateScore(BigDecimal.ZERO.setScale(4))
                .deathRelatedScore(BigDecimal.ZERO.setScale(4))
                .spamScore(BigDecimal.ZERO.setScale(4))
                .privacyScore(BigDecimal.ZERO.setScale(4))
                .finalScore(BigDecimal.ZERO.setScale(4))
                .sentiment("NEUTRAL")
                .ratingCommentMismatch(false)
                .categories("[\"AI_ERROR\"]")
                .rawResponse("{\"error\":\"" + escape(reason) + "\",\"raw\":\"" + escape(limitText(rawResponse, 600)) + "\"}")
                .severeViolation(false)
                .needsAdminReview(false)
                .build();
    }

    private String buildPrompt(Integer rating, String comment) {
        return """
                Bạn là hệ thống kiểm duyệt đánh giá homestay tiếng Việt.
                Chỉ trả về một JSON object hợp lệ. Không dùng markdown. Không dùng ```json. Không giải thích ngoài JSON.
                Không bỏ sót dấu ngoặc. Nếu không chắc, vẫn phải trả JSON đúng schema.
                Tất cả score phải là số từ 0.0 đến 1.0.

                Nhiệm vụ:
                - Chấm điểm độc hại từ 0.0 đến 1.0.
                - Không đánh dấu vi phạm nếu khách chê dịch vụ lịch sự.
                - Review tiêu cực hợp lệ vẫn được phép hiển thị.
                - Phát hiện chửi tục, xúc phạm, đe dọa, chết chóc, bạo lực, thù ghét, spam, lộ thông tin cá nhân.
                - Phát hiện rating và comment có mâu thuẫn không.

                Rating: %s
                Comment:
                \"\"\"
                %s
                \"\"\"

                JSON schema bắt buộc:
                {
                  "toxicityScore": 0.0,
                  "profanityScore": 0.0,
                  "insultScore": 0.0,
                  "threatScore": 0.0,
                  "hateScore": 0.0,
                  "deathRelatedScore": 0.0,
                  "spamScore": 0.0,
                  "privacyScore": 0.0,
                  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
                  "ratingCommentMismatch": false,
                  "categories": ["SAFE | LEGIT_NEGATIVE | PROFANITY | INSULT | THREAT | DEATH_RELATED | HATE | SPAM | PRIVACY | IRRELEVANT"],
                  "action": "ALLOW | FLAG_FOR_REVIEW | HIDE",
                  "reason": "Lý do ngắn gọn bằng tiếng Việt"
                }

                Quy tắc: tiêu cực lịch sự = ALLOW; xúc phạm nhẹ = FLAG_FOR_REVIEW; đe dọa/chết chóc/hate nặng = HIDE.
                """.formatted(rating, comment == null ? "" : comment);
    }

    private String extractJson(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Gemini response is empty");
        }
        String cleaned = raw.trim()
                .replace("```json", "")
                .replace("```JSON", "")
                .replace("```", "")
                .trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0 || end < 0 || end <= start) {
            throw new IllegalArgumentException("Cannot find JSON object in Gemini response");
        }
        return cleaned.substring(start, end + 1);
    }

    private BigDecimal score(JsonNode node, String field) {
        double value = node.path(field).asDouble(0.0);
        if (value < 0) value = 0;
        if (value > 1) value = 1;
        return BigDecimal.valueOf(value).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal max(BigDecimal... values) {
        BigDecimal result = BigDecimal.ZERO.setScale(4);
        for (BigDecimal value : values) {
            if (value != null && value.compareTo(result) > 0) result = value;
        }
        return result;
    }

    private String normalizeAction(String action) {
        String normalized = action == null ? "ALLOW" : action.trim().toUpperCase();
        if ("HIDE".equals(normalized) || "FLAG_FOR_REVIEW".equals(normalized)) return normalized;
        return "ALLOW";
    }

    private String normalizeSentiment(String sentiment) {
        String normalized = sentiment == null ? "NEUTRAL" : sentiment.trim().toUpperCase();
        return switch (normalized) {
            case "POSITIVE", "NEGATIVE" -> normalized;
            default -> "NEUTRAL";
        };
    }

    private String limitText(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    private String escape(String value) {
        return value == null ? "" : value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}