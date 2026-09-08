package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class HostMaintenanceNotificationResponse {
    private Long maintenanceFeeId;
    private String notificationType;
    private String title;
    private String message;
    private Integer billingMonth;
    private Integer billingYear;
    private LocalDate dueDate;
    private String paymentStatus;
    private LocalDateTime createdAt;
}