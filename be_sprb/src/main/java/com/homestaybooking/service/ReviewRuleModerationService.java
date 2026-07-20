package com.homestaybooking.service;

import com.homestaybooking.dto.response.ReviewModerationResult;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Service
public class ReviewRuleModerationService {
    public ReviewModerationResult moderate(Integer rating, String comment) {
        String text = normalize(comment);
        Set<String> categories = new LinkedHashSet<>();
        boolean threat = containsAny(text, " giet ", " gietchet ", " dam chet ", " danh chet ", " se giet ", " doa giet " );
        boolean death = containsAny(text, " chet di ", " tu tu ", " mau chet ", " chet het ");
        boolean hate = containsAny(text, " rac ruoi ", " suc vat ", " do khon ", " bien di ");
        boolean profanity = containsAny(text, " dm ", " dit ", " lon ", " cmm ", " vcl ", " vl ");
        boolean spam = containsAny(text, " http:// ", " https:// ", " zalo ", " telegram ", " casino ", " ca do ");
        boolean privacy = containsAny(text, " so cmnd ", " can cuoc ", " so tai khoan ", " mat khau ");
        boolean mismatch = rating != null && rating >= 4 && containsAny(text, " rat te ", " qua te ", " that vong ", " khong bao gio quay lai ");

        if (threat) categories.add("THREAT");
        if (death) categories.add("DEATH_RELATED");
        if (hate) categories.add("HATE");
        if (profanity) categories.add("PROFANITY");
        if (spam) categories.add("SPAM");
        if (privacy) categories.add("PRIVACY");
        if (mismatch) categories.add("RATING_MISMATCH");
        if (categories.isEmpty()) categories.add("SAFE");

        boolean severe = threat || death || privacy;
        boolean needsReview = severe || hate || profanity || spam || mismatch;
        String action = severe ? "HIDE" : needsReview ? "FLAG_FOR_REVIEW" : "ALLOW";
        return ReviewModerationResult.builder()
                .provider("COZYGO_RULES")
                .modelName("rule-v1")
                .moderationStatus(severe ? "RULE_HIDDEN" : needsReview ? "RULE_FLAGGED" : "RULE_SAFE")
                .moderationAction(action)
                .adminReviewStatus(needsReview ? "PENDING" : "NONE")
                .moderationReason(needsReview ? "Quy tắc nội bộ phát hiện nội dung cần kiểm tra." : "Không phát hiện vi phạm bằng quy tắc nội bộ.")
                .toxicityScore(score(hate || profanity, severe ? "0.85" : "0.50"))
                .profanityScore(score(profanity, "0.65"))
                .insultScore(score(hate, "0.60"))
                .threatScore(score(threat, "0.90"))
                .hateScore(score(hate, "0.70"))
                .deathRelatedScore(score(death, "0.90"))
                .spamScore(score(spam, "0.55"))
                .privacyScore(score(privacy, "0.90"))
                .finalScore(score(needsReview, severe ? "0.90" : "0.55"))
                .sentiment(rating != null && rating <= 2 ? "NEGATIVE" : rating != null && rating >= 4 ? "POSITIVE" : "NEUTRAL")
                .ratingCommentMismatch(mismatch)
                .categories(toJsonArray(categories))
                .rawResponse("{\"source\":\"rules\"}")
                .severeViolation(severe)
                .needsAdminReview(needsReview)
                .build();
    }

    private BigDecimal score(boolean condition, String value) {
        return condition ? new BigDecimal(value) : BigDecimal.ZERO.setScale(4);
    }

    private boolean containsAny(String text, String... keywords) {
        String wrapped = " " + text + " ";
        for (String keyword : keywords) {
            if (wrapped.contains(keyword)) return true;
        }
        return false;
    }

    private String normalize(String value) {
        String text = value == null ? "" : value.toLowerCase(Locale.ROOT);
        text = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return text.replaceAll("[^a-z0-9:/._-]+", " ").trim();
    }

    private String toJsonArray(Set<String> categories) {
        return "[\"" + String.join("\",\"", categories) + "\"]";
    }
}

