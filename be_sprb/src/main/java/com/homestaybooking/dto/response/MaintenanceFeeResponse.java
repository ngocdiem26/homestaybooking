package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MaintenanceFeeResponse {
    private Long maintenanceFeeId;
    private Integer hostId;
    private String hostName;
    private Integer billingMonth;
    private Integer billingYear;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal feeAmount;
    private LocalDate dueDate;
    private String paymentStatus;
    private LocalDateTime paidAt;
    private String paymentMethod;
    private String transactionReference;
    private String adminNote;
    private LocalDateTime reminderSentAt;
    private LocalDateTime overdueWarningSentAt;
}
