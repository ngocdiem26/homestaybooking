package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.ReviewModerationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAiModerationClient {
    private final OpenAiModerationProperties properties;
    private final ObjectMapper objectMapper;

    public ReviewModerationResult moderateText(String text) {
        if (text == null || text.isBlank()) {
            return safeResult("OPENAI_EMPTY", "Không có nội dung để kiểm duyệt.");
        }
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            return errorResult("OPENAI_API_KEY chưa được cấu hình.");
        }

        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(Duration.ofSeconds(5));
            requestFactory.setReadTimeout(Duration.ofSeconds(12));

            RestClient client = RestClient.builder()
                    .baseUrl(trimTrailingSlash(properties.getBaseUrl()))
                    .requestFactory(requestFactory)
                    .build();

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", safeModel());
            body.put("input", text);

            String rawResponse = client.post()
                    .uri("/moderations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .body(body)
                    .retrieve()
                    .body(String.class);

            return parseResponse(rawResponse);
        } catch (Exception exception) {
            log.warn("OpenAI moderation failed: {}", exception.getMessage());
            return errorResult("OpenAI Moderation tạm thời không phản hồi, hệ thống dùng rule-based fallback.");
        }
    }

    private ReviewModerationResult parseResponse(String rawResponse) throws Exception {
        JsonNode root = objectMapper.readTree(rawResponse == null ? "{}" : rawResponse);
        JsonNode result = root.path("results").isArray() && !root.path("results").isEmpty()
                ? root.path("results").get(0)
                : objectMapper.createObjectNode();
        JsonNode scores = result.path("category_scores");
        JsonNode categoriesNode = result.path("categories");

        boolean flagged = result.path("flagged").asBoolean(false);
        List<String> categories = extractFlaggedCategories(categoriesNode);
        boolean severe = hasSevereOpenAiCategory(categories);

        BigDecimal harassment = score(scores, "harassment");
        BigDecimal harassmentThreatening = score(scores, "harassment/threatening");
        BigDecimal hate = score(scores, "hate");
        BigDecimal hateThreatening = score(scores, "hate/threatening");
        BigDecimal violence = score(scores, "violence");
        BigDecimal violenceGraphic = score(scores, "violence/graphic");
        BigDecimal sexual = score(scores, "sexual");
        BigDecimal sexualMinors = score(scores, "sexual/minors");
        BigDecimal selfHarm = max(score(scores, "self-harm"), score(scores, "self-harm/intent"), score(scores, "self-harm/instructions"));
        BigDecimal illicit = score(scores, "illicit");
        BigDecimal illicitViolent = score(scores, "illicit/violent");

        BigDecimal toxicity = max(harassment, hate, violence, sexual, sexualMinors, illicit, illicitViolent);
        BigDecimal insult = harassment;
        BigDecimal threat = max(harassmentThreatening, hateThreatening, violence, illicitViolent);
        BigDecimal hateScore = max(hate, hateThreatening);
        BigDecimal death = max(violence, violenceGraphic, selfHarm);
        BigDecimal finalScore = max(toxicity, insult, threat, hateScore, death);

        String action = severe ? "HIDE" : flagged ? "FLAG_FOR_REVIEW" : "ALLOW";
        String adminStatus = flagged || severe ? "PENDING" : "NONE";
        String moderationStatus = severe ? "OPENAI_HIDDEN" : flagged ? "OPENAI_FLAGGED" : "OPENAI_SAFE";
        String reason = severe
                ? "OpenAI Moderation phát hiện nhóm nội dung nghiêm trọng, cần ẩn tạm thời để admin xem xét."
                : flagged
                ? "OpenAI Moderation phát hiện nội dung cần admin kiểm tra thêm."
                : "OpenAI Moderation không phát hiện nội dung vi phạm.";

        return ReviewModerationResult.builder()
                .provider("OPENAI_MODERATION")
                .modelName(root.path("model").asText(safeModel()))
                .moderationStatus(moderationStatus)
                .moderationAction(action)
                .adminReviewStatus(adminStatus)
                .moderationReason(reason)
                .toxicityScore(toxicity)
                .profanityScore(BigDecimal.ZERO.setScale(4))
                .insultScore(insult)
                .threatScore(threat)
                .hateScore(hateScore)
                .deathRelatedScore(death)
                .spamScore(BigDecimal.ZERO.setScale(4))
                .privacyScore(BigDecimal.ZERO.setScale(4))
                .finalScore(finalScore)
                .sentiment("NEUTRAL")
                .ratingCommentMismatch(false)
                .categories(toJsonArray(categories.isEmpty() ? List.of("SAFE") : categories))
                .rawResponse(validJsonRaw("OPENAI_MODERATION", rawResponse))
                .severeViolation(severe)
                .needsAdminReview(flagged || severe)
                .build();
    }

    private ReviewModerationResult safeResult(String status, String reason) {
        return ReviewModerationResult.builder()
                .provider("OPENAI_MODERATION")
                .modelName(safeModel())
                .moderationStatus(status)
                .moderationAction("ALLOW")
                .adminReviewStatus("NONE")
                .moderationReason(reason)
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
                .categories("[\"SAFE\"]")
                .rawResponse(validJsonRaw("OPENAI_MODERATION", reason))
                .severeViolation(false)
                .needsAdminReview(false)
                .build();
    }

    private ReviewModerationResult errorResult(String reason) {
        return ReviewModerationResult.builder()
                .provider("OPENAI_ERROR")
                .modelName("openai-error")
                .moderationStatus("OPENAI_ERROR")
                .moderationAction("ALLOW")
                .adminReviewStatus("NONE")
                .moderationReason(reason)
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
                .categories("[\"OPENAI_ERROR\"]")
                .rawResponse(validJsonRaw("OPENAI_ERROR", reason))
                .severeViolation(false)
                .needsAdminReview(false)
                .build();
    }

    private List<String> extractFlaggedCategories(JsonNode categoriesNode) {
        List<String> categories = new ArrayList<>();
        if (categoriesNode == null || !categoriesNode.isObject()) return categories;
        categoriesNode.fields().forEachRemaining(entry -> {
            if (entry.getValue().asBoolean(false)) categories.add(entry.getKey().toUpperCase().replace('/', '_').replace('-', '_'));
        });
        return categories;
    }

    private boolean hasSevereOpenAiCategory(List<String> categories) {
        return categories.contains("HARASSMENT_THREATENING")
                || categories.contains("HATE_THREATENING")
                || categories.contains("VIOLENCE_GRAPHIC")
                || categories.contains("SEXUAL_MINORS")
                || categories.contains("ILLICIT_VIOLENT");
    }

    private BigDecimal score(JsonNode scores, String fieldName) {
        if (scores == null || scores.path(fieldName).isMissingNode() || !scores.path(fieldName).isNumber()) {
            return BigDecimal.ZERO.setScale(4);
        }
        return BigDecimal.valueOf(scores.path(fieldName).asDouble()).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal max(BigDecimal... values) {
        BigDecimal max = BigDecimal.ZERO.setScale(4);
        for (BigDecimal value : values) {
            if (value != null && value.compareTo(max) > 0) max = value;
        }
        return max;
    }

    private String toJsonArray(List<String> items) throws Exception {
        return objectMapper.writeValueAsString(items);
    }

    private String validJsonRaw(String provider, String value) {
        try {
            Map<String, String> payload = new LinkedHashMap<>();
            payload.put("provider", provider);
            payload.put("message", safeLength(stripUnsafeCharacters(value), 3000));
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            return "{\"provider\":\"" + provider + "\",\"message\":\"Không thể ghi raw response\"}";
        }
    }

    private String stripUnsafeCharacters(String value) {
        if (value == null) return "";
        StringBuilder builder = new StringBuilder();
        value.codePoints().forEach(codePoint -> {
            if (codePoint == 9 || codePoint == 10 || codePoint == 13 || codePoint >= 32) {
                builder.appendCodePoint(codePoint);
            }
        });
        return builder.toString();
    }

    private String safeLength(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) return value;
        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }

    private String trimTrailingSlash(String value) {
        String baseUrl = value == null || value.isBlank() ? "https://api.openai.com/v1" : value.trim();
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private String safeModel() {
        return properties.getModerationModel() == null || properties.getModerationModel().isBlank()
                ? "omni-moderation-latest"
                : properties.getModerationModel();
    }
}
