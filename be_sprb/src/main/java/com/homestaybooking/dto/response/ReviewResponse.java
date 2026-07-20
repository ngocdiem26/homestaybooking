package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private Integer replyId;
    private String replyContent;
    private String replyAuthorName;
    private LocalDateTime replyCreatedAt;
    private LocalDateTime replyUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
