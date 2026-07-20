package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintMessageResponse {
    private Integer messageId;
    private Integer complaintId;
    private Integer senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private LocalDateTime createdAt;
}
