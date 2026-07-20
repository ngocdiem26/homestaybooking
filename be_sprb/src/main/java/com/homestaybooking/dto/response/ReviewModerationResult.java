package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewModerationResult {
    private String provider;
    private String modelName;
    private String moderationStatus;
    private String moderationAction;
    private String adminReviewStatus;
    private String moderationReason;
    private BigDecimal toxicityScore;
    private BigDecimal profanityScore;
    private BigDecimal insultScore;
    private BigDecimal threatScore;
    private BigDecimal hateScore;
    private BigDecimal deathRelatedScore;
    private BigDecimal spamScore;
    private BigDecimal privacyScore;
    private BigDecimal finalScore;
    private String sentiment;
    private Boolean ratingCommentMismatch;
    private String categories;
    private String rawResponse;
    private Boolean severeViolation;
    private Boolean needsAdminReview;
}
