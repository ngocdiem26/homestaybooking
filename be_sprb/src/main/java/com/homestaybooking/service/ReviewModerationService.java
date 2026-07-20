package com.homestaybooking.service;

import com.homestaybooking.dto.response.ReviewModerationResult;
import com.homestaybooking.dto.response.ReviewResponse;
import com.homestaybooking.repository.ReviewJdbcRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReviewModerationService {
    private static final BigDecimal SEVERE_SCORE = BigDecimal.valueOf(0.70);
    private static final BigDecimal REVIEW_SCORE = BigDecimal.valueOf(0.40);

    private final ReviewRuleModerationService ruleModerationService;
    private final GeminiReviewModerationClient geminiReviewModerationClient;
    private final ReviewJdbcRepository reviewRepository;
    private final ReviewModerationMailService mailService;

    public ReviewResponse moderateAndApply(ReviewResponse review) {
        ReviewModerationResult ruleResult = ruleModerationService.moderate(review.getRating(), review.getComment());
        ReviewModerationResult aiResult = geminiReviewModerationClient.moderate(review.getRating(), review.getComment());
        ReviewModerationResult finalResult = combine(ruleResult, aiResult);

        reviewRepository.updateModeration(review.getReviewId(), finalResult);
        reviewRepository.insertModerationLog(review.getReviewId(), ruleResult);
        reviewRepository.insertModerationLog(review.getReviewId(), aiResult);
        reviewRepository.insertModerationLog(review.getReviewId(), finalResult);

        ReviewResponse updated = reviewRepository.findById(review.getReviewId());
        if ("PENDING".equalsIgnoreCase(updated.getAdminReviewStatus())) {
            mailService.notifyAdmin(updated);
        }
        return updated;
    }

    private ReviewModerationResult combine(ReviewModerationResult rule, ReviewModerationResult ai) {
        if (isAiError(ai)) {
            return fallbackFromRule(rule);
        }

        BigDecimal toxicity = max(rule.getToxicityScore(), ai.getToxicityScore());
        BigDecimal profanity = max(rule.getProfanityScore(), ai.getProfanityScore());
        BigDecimal insult = max(rule.getInsultScore(), ai.getInsultScore());
        BigDecimal threat = max(rule.getThreatScore(), ai.getThreatScore());
        BigDecimal hate = max(rule.getHateScore(), ai.getHateScore());
        BigDecimal death = max(rule.getDeathRelatedScore(), ai.getDeathRelatedScore());
        BigDecimal spam = max(rule.getSpamScore(), ai.getSpamScore());
        BigDecimal privacy = max(rule.getPrivacyScore(), ai.getPrivacyScore());
        BigDecimal finalScore = max(toxicity, profanity, insult, threat, hate, death, spam, privacy);

        boolean mismatch = Boolean.TRUE.equals(rule.getRatingCommentMismatch()) || Boolean.TRUE.equals(ai.getRatingCommentMismatch());
        boolean severe = isSevere(rule.getModerationAction(), toxicity, threat, hate, death, privacy)
                || isSevere(ai.getModerationAction(), toxicity, threat, hate, death, privacy)
                || Boolean.TRUE.equals(rule.getSevereViolation())
                || Boolean.TRUE.equals(ai.getSevereViolation());
        boolean needsReview = severe
                || mismatch
                || "FLAG_FOR_REVIEW".equalsIgnoreCase(rule.getModerationAction())
                || "FLAG_FOR_REVIEW".equalsIgnoreCase(ai.getModerationAction())
                || Boolean.TRUE.equals(rule.getNeedsAdminReview())
                || Boolean.TRUE.equals(ai.getNeedsAdminReview())
                || finalScore.compareTo(REVIEW_SCORE) >= 0;

        String action = severe ? "HIDE" : needsReview ? "FLAG_FOR_REVIEW" : "ALLOW";
        String status = severe ? "AI_HIDDEN" : needsReview ? "AI_FLAGGED" : "AI_SAFE";
        String adminStatus = needsReview ? "PENDING" : "NONE";
        String reason = severe
                ? "Nội dung có dấu hiệu vi phạm nghiêm trọng nên được ẩn tạm thời để admin xem xét. " + mergeReasons(rule, ai)
                : needsReview
                ? "Đánh giá đang hiển thị công khai nhưng cần admin kiểm tra thêm. " + mergeReasons(rule, ai)
                : "Đánh giá không có dấu hiệu vi phạm cộng đồng.";

        return ReviewModerationResult.builder()
                .provider("COZYGO_MODERATION")
                .modelName(ai.getModelName())
                .moderationStatus(status)
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
                .categories(mergeCategories(rule.getCategories(), ai.getCategories()))
                .rawResponse("{\"rule\":" + quote(rule.getModerationAction()) + ",\"ai\":" + quote(ai.getModerationAction()) + "}")
                .severeViolation(severe)
                .needsAdminReview(needsReview)
                .build();
    }

    private ReviewModerationResult fallbackFromRule(ReviewModerationResult rule) {
        BigDecimal toxicity = value(rule.getToxicityScore());
        BigDecimal profanity = value(rule.getProfanityScore());
        BigDecimal insult = value(rule.getInsultScore());
        BigDecimal threat = value(rule.getThreatScore());
        BigDecimal hate = value(rule.getHateScore());
        BigDecimal death = value(rule.getDeathRelatedScore());
        BigDecimal spam = value(rule.getSpamScore());
        BigDecimal privacy = value(rule.getPrivacyScore());
        BigDecimal finalScore = max(toxicity, profanity, insult, threat, hate, death, spam, privacy);

        boolean mismatch = Boolean.TRUE.equals(rule.getRatingCommentMismatch());
        boolean severe = isSevere(rule.getModerationAction(), toxicity, threat, hate, death, privacy)
                || Boolean.TRUE.equals(rule.getSevereViolation());
        boolean needsReview = severe
                || mismatch
                || "FLAG_FOR_REVIEW".equalsIgnoreCase(rule.getModerationAction())
                || Boolean.TRUE.equals(rule.getNeedsAdminReview())
                || finalScore.compareTo(REVIEW_SCORE) >= 0;

        String action = severe ? "HIDE" : needsReview ? "FLAG_FOR_REVIEW" : "ALLOW";
        String adminStatus = needsReview ? "PENDING" : "NONE";
        String reason = severe
                ? "Rule-based phát hiện nội dung nguy hiểm nên đánh giá đã bị ẩn tạm thời để admin xem xét. AI không trả về JSON hợp lệ nên hệ thống đã dùng rule-based fallback."
                : needsReview
                ? "Rule-based phát hiện đánh giá cần admin kiểm tra thêm. AI không trả về JSON hợp lệ nên hệ thống đã dùng rule-based fallback."
                : "AI không trả về JSON hợp lệ nên hệ thống dùng rule-based fallback. Rule-based không phát hiện vi phạm.";

        return ReviewModerationResult.builder()
                .provider("RULE_BASED_FALLBACK")
                .modelName("gemini-error")
                .moderationStatus("AI_ERROR")
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
                .sentiment(safe(rule.getSentiment(), "NEUTRAL"))
                .ratingCommentMismatch(mismatch)
                .categories(mergeCategories(rule.getCategories(), "[\"AI_ERROR\"]"))
                .rawResponse("{\"fallback\":true,\"reason\":\"Gemini did not return valid JSON\"}")
                .severeViolation(severe)
                .needsAdminReview(needsReview)
                .build();
    }

    private boolean isAiError(ReviewModerationResult result) {
        return result == null
                || "AI_ERROR".equalsIgnoreCase(result.getModerationStatus())
                || "RULE_BASED_FALLBACK".equalsIgnoreCase(result.getProvider());
    }

    private boolean isSevere(String action, BigDecimal toxicity, BigDecimal threat, BigDecimal hate, BigDecimal death, BigDecimal privacy) {
        return "HIDE".equalsIgnoreCase(action)
                || threat.compareTo(SEVERE_SCORE) >= 0
                || death.compareTo(SEVERE_SCORE) >= 0
                || hate.compareTo(BigDecimal.valueOf(0.80)) >= 0
                || privacy.compareTo(BigDecimal.valueOf(0.80)) >= 0
                || toxicity.compareTo(BigDecimal.valueOf(0.90)) >= 0;
    }

    private String mergeReasons(ReviewModerationResult rule, ReviewModerationResult ai) {
        return "Rule: " + safe(rule.getModerationReason(), "Không có ghi chú.") + " | AI: " + safe(ai.getModerationReason(), "Không có ghi chú.");
    }

    private String mergeCategories(String first, String second) {
        Set<String> categories = new LinkedHashSet<>();
        collectCategories(categories, first);
        collectCategories(categories, second);
        if (categories.isEmpty()) categories.add("SAFE");
        return "[\"" + String.join("\",\"", categories) + "\"]";
    }

    private void collectCategories(Set<String> categories, String jsonArray) {
        if (jsonArray == null || jsonArray.isBlank()) return;
        String cleaned = jsonArray.replace("[", "").replace("]", "").replace("\"", "");
        for (String item : cleaned.split(",")) {
            String category = item.trim().toUpperCase();
            if (!category.isBlank()) categories.add(category);
        }
    }

    private BigDecimal max(BigDecimal... values) {
        BigDecimal max = BigDecimal.ZERO;
        for (BigDecimal item : values) {
            if (item != null && item.compareTo(max) > 0) max = item;
        }
        return max;
    }

    private BigDecimal value(BigDecimal item) {
        return item == null ? BigDecimal.ZERO : item;
    }

    private String prefer(String first, String second, String fallback) {
        if (first != null && !first.isBlank() && !"NEUTRAL".equalsIgnoreCase(first)) return first;
        if (second != null && !second.isBlank()) return second;
        return fallback;
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String quote(String value) {
        return "\"" + (value == null ? "" : value.replace("\"", "\\\"")) + "\"";
    }
}