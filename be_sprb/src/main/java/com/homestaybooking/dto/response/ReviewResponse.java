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
public class ReviewResponse {
    private Integer reviewId;
    private Integer bookingId;
    private String bookingCode;
    private Integer homeId;
    private String homestayCode;
    private String homestayName;
    private String homestayImage;
    private Integer userId;
    private String customerName;
    private String customerEmail;
    private String customerAvatar;
    private Integer hostId;
    private String hostName;
    private Integer rating;
    private String comment;
    private String status;
    private String reviewStatus;
    private String adminReviewStatus;
    private String moderationStatus;
    private String moderationAction;
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
    private String moderationCategories;
    private LocalDateTime moderatedAt;
    private Integer moderatedBy;
    private String hiddenReason;
    private String displayStatusLabel;
    private Integer replyId;
    private String replyContent;
    private String replyAuthorName;
    private LocalDateTime replyCreatedAt;
    private LocalDateTime replyUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
