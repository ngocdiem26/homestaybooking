package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewModerationLogResponse {
    private Integer logId;
    private Integer reviewId;
    private String provider;
    private String modelName;
    private String rawResponse;
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
    private String moderationAction;
    private String adminReviewStatus;
    private String moderationReason;
    private LocalDateTime createdAt;
}
