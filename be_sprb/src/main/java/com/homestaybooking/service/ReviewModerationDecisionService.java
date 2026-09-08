package com.homestaybooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestaybooking.dto.response.ReviewModerationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReviewModerationDecisionService {
    private static final BigDecimal REVIEW_SCORE = BigDecimal.valueOf(0.40);
    private static final BigDecimal THREAT_SEVERE = BigDecimal.valueOf(0.70);
    private static final BigDecimal DEATH_SEVERE = BigDecimal.valueOf(0.70);
    private static final BigDecimal HATE_SEVERE = BigDecimal.valueOf(0.80);
    private static final BigDecimal PRIVACY_SEVERE = BigDecimal.valueOf(0.80);
    private static final BigDecimal TOXICITY_SEVERE = BigDecimal.valueOf(0.90);

    private final ObjectMapper objectMapper;

    public ReviewModerationResult decide(ReviewModerationResult ruleResult, ReviewModerationResult openAiResult) {
        boolean openAiError = isOpenAiError(openAiResult);
        ReviewModerationResult ai = openAiError ? emptyOpenAiFallback() : openAiResult;
        ReviewModerationResult rule = ruleResult == null ? emptyRule() : ruleResult;

        BigDecimal toxicity = max(rule.getToxicityScore(), ai.getToxicityScore());
        BigDecimal profanity = max(rule.getProfanityScore(), ai.getProfanityScore());
        BigDecimal insult = max(rule.getInsultScore(), ai.getInsultScore());
        BigDecimal threat = max(rule.getThreatScore(), ai.getThreatScore());
        BigDecimal hate = max(rule.getHateScore(), ai.getHateScore());
        BigDecimal death = max(rule.getDeathRelatedScore(), ai.getDeathRelatedScore());
        BigDecimal spam = max(rule.getSpamScore(), ai.getSpamScore());
        BigDecimal privacy = max(rule.getPrivacyScore(), ai.getPrivacyScore());
        BigDecimal finalScore = max(toxicity, profanity, insult, threat, hate, death, spam, privacy);

        Set<String> categories = mergeCategories(rule.getCategories(), ai.getCategories());
        boolean mismatch = Boolean.TRUE.equals(rule.getRatingCommentMismatch()) || Boolean.TRUE.equals(ai.getRatingCommentMismatch());
        boolean severe = Boolean.TRUE.equals(rule.getSevereViolation())
                || Boolean.TRUE.equals(ai.getSevereViolation())
                || threat.compareTo(THREAT_SEVERE) >= 0
                || death.compareTo(DEATH_SEVERE) >= 0
                || hate.compareTo(HATE_SEVERE) >= 0
                || privacy.compareTo(PRIVACY_SEVERE) >= 0
                || toxicity.compareTo(TOXICITY_SEVERE) >= 0
                || categories.contains("HARASSMENT_THREATENING")
                || categories.contains("HATE_THREATENING")
                || categories.contains("VIOLENCE_GRAPHIC")
                || categories.contains("SEXUAL_MINORS");

        boolean needsReview = severe
                || mismatch
                || finalScore.compareTo(REVIEW_SCORE) >= 0
                || value(profanity).compareTo(REVIEW_SCORE) >= 0
                || value(insult).compareTo(REVIEW_SCORE) >= 0
                || value(spam).compareTo(REVIEW_SCORE) >= 0
                || value(privacy).compareTo(REVIEW_SCORE) >= 0
                || Boolean.TRUE.equals(rule.getNeedsAdminReview())
                || Boolean.TRUE.equals(ai.getNeedsAdminReview());

        String action = severe ? "HIDE" : needsReview ? "FLAG_FOR_REVIEW" : "ALLOW";
        String adminStatus = needsReview ? "PENDING" : "NONE";
        String moderationStatus = openAiError
                ? "OPENAI_ERROR_FALLBACK"
                : severe ? "SEVERE" : needsReview ? "SUSPICIOUS" : "SAFE";

        String reason = buildHumanReason(categories, severe, needsReview, openAiError, rule.getSentiment());
        if (categories.isEmpty()) categories.add("SAFE");

        return ReviewModerationResult.builder()
                .provider(openAiError ? "RULE_BASED_FALLBACK" : "COZYGO_RULES_OPENAI")
                .modelName(openAiError ? "openai-error" : safe(ai.getModelName(), "omni-moderation-latest"))
                .moderationStatus(moderationStatus)
                .moderationAction(action)
                .adminReviewStatus(adminStatus)
                .moderationReason(reason)
                .toxicityScore(toxicity)
                .profanityScore(profanity)
                .insultScore(insult)
                .threatScore(threat)
                .hateScore(hate)
                .deathRelatedScore(death)
                .spamScore(spam)
                .privacyScore(privacy)
                .finalScore(finalScore)
                .sentiment(prefer(ai.getSentiment(), rule.getSentiment(), "NEUTRAL"))
                .ratingCommentMismatch(mismatch)
                .categories(toJsonArray(categories))
                .rawResponse(finalRawResponse(openAiError, rule, openAiResult, action))
                .severeViolation(severe)
                .needsAdminReview(needsReview)
                .build();
    }

    private String buildHumanReason(Set<String> categories, boolean severe, boolean needsReview, boolean openAiError, String sentiment) {
        if (severe && categories.contains("THREAT")) {
            return "Nội dung có dấu hiệu đe dọa nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }
        if (severe && categories.contains("PRIVACY")) {
            return "Nội dung có dấu hiệu lộ thông tin riêng tư nhạy cảm nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }
        if (severe) {
            return "Nội dung có dấu hiệu vi phạm nghiêm trọng nên đánh giá đã bị ẩn tạm thời để admin xem xét.";
        }
        if (needsReview && (categories.contains("PROFANITY") || categories.contains("INSULT"))) {
            return "Nội dung có từ ngữ xúc phạm nên được chuyển đến admin xem xét, nhưng vẫn hiển thị công khai.";
        }
        if (needsReview && categories.contains("SPAM")) {
            return "Nội dung có dấu hiệu spam hoặc quảng cáo ngoài hệ thống nên cần admin xem xét.";
        }
        if (needsReview && categories.contains("PRIVACY")) {
            return "Nội dung có dấu hiệu chứa thông tin riêng tư hoặc thông tin liên hệ nên cần admin xem xét.";
        }
        if (needsReview && categories.contains("RATING_COMMENT_MISMATCH")) {
            return "Điểm sao và nội dung nhận xét chưa đồng nhất nên cần admin xem xét thêm.";
        }
        if (openAiError && needsReview) {
            return "OpenAI Moderation tạm thời không phản hồi, hệ thống đã dùng bộ quy tắc tiếng Việt và phát hiện nội dung cần admin xem xét.";
        }
        if ("NEGATIVE".equalsIgnoreCase(sentiment)) {
            return "Đánh giá tiêu cực nhưng không có dấu hiệu vi phạm nên được hiển thị.";
        }
        return "Đánh giá không có dấu hiệu vi phạm quy định nội dung.";
    }

    private boolean isOpenAiError(ReviewModerationResult result) {
        return result == null
                || "OPENAI_ERROR".equalsIgnoreCase(result.getModerationStatus())
                || "OPENAI_ERROR".equalsIgnoreCase(result.getProvider());
    }

    private Set<String> mergeCategories(String... categoryJsonValues) {
        Set<String> categories = new LinkedHashSet<>();
        for (String json : categoryJsonValues) {
            if (json == null || json.isBlank()) continue;
            try {
                JsonNode node = objectMapper.readTree(json);
                if (node.isArray()) {
                    node.forEach(item -> addCategory(categories, item.asText()));
                    continue;
                }
            } catch (Exception ignored) {
                // Fall through to tolerate old comma-separated strings.
            }
            String cleaned = json.replace("[", "").replace("]", "").replace("\"", "");
            for (String item : cleaned.split(",")) addCategory(categories, item);
        }
        categories.remove("SAFE");
        categories.remove("OPENAI_ERROR");
        return categories;
    }

    private void addCategory(Set<String> categories, String value) {
        if (value == null || value.isBlank()) return;
        categories.add(value.trim().toUpperCase().replace('/', '_').replace('-', '_').replace(' ', '_'));
    }

    private String toJsonArray(Set<String> categories) {
        try {
            return objectMapper.writeValueAsString(categories);
        } catch (Exception exception) {
            return "[\"SAFE\"]";
        }
    }

    private String finalRawResponse(boolean openAiError, ReviewModerationResult rule, ReviewModerationResult openAi, String action) {
        try {
            Map<String, Object> raw = new LinkedHashMap<>();
            raw.put("source", openAiError ? "rule-based-fallback" : "rule-based-plus-openai");
            raw.put("ruleAction", safe(rule.getModerationAction(), "ALLOW"));
            raw.put("openAiAction", openAi == null ? "OPENAI_ERROR" : safe(openAi.getModerationAction(), "ALLOW"));
            raw.put("finalAction", action);
            raw.put("openAiStatus", openAi == null ? "OPENAI_ERROR" : safe(openAi.getModerationStatus(), "OPENAI_ERROR"));
            return objectMapper.writeValueAsString(raw);
        } catch (Exception exception) {
            return "{\"source\":\"review-moderation\",\"finalAction\":\"" + action + "\"}";
        }
    }

    private ReviewModerationResult emptyRule() {
        return ReviewModerationResult.builder()
                .provider("VIETNAMESE_RULES")
                .moderationAction("ALLOW")
                .adminReviewStatus("NONE")
                .sentiment("NEUTRAL")
                .ratingCommentMismatch(false)
                .categories("[\"SAFE\"]")
                .severeViolation(false)
                .needsAdminReview(false)
                .build();
    }

    private ReviewModerationResult emptyOpenAiFallback() {
        return ReviewModerationResult.builder()
                .provider("OPENAI_ERROR")
                .modelName("openai-error")
                .moderationAction("ALLOW")
                .adminReviewStatus("NONE")
                .sentiment("NEUTRAL")
                .ratingCommentMismatch(false)
                .categories("[\"OPENAI_ERROR\"]")
                .severeViolation(false)
                .needsAdminReview(false)
                .build();
    }

    private BigDecimal max(BigDecimal... values) {
        BigDecimal max = BigDecimal.ZERO;
        for (BigDecimal item : values) {
            if (item != null && item.compareTo(max) > 0) max = item;
        }
        return max;
    }

    private BigDecimal value(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String prefer(String first, String second, String fallback) {
        if (first != null && !first.isBlank() && !"NEUTRAL".equalsIgnoreCase(first)) return first;
        if (second != null && !second.isBlank()) return second;
        return fallback;
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
