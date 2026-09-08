package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminCommissionResponse {
    private Long commissionId;
    private Integer bookingId;
    private String bookingCode;
    private String customerName;
    private Integer hostId;
    private String hostName;
    private Integer homestayId;
    private String homestayName;
    private LocalDate checkinDate;
    private LocalDate checkoutDate;
    private BigDecimal bookingAmount;
    private BigDecimal refundAmount;
    private BigDecimal retainedAmount;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private BigDecimal hostReceivableAmount;
    private String bookingStatus;
    private String paymentStatus;
    private String paymentMethod;
    private String commissionStatus;
    private String cancellationType;
    private String refundStatus;
    private LocalDateTime calculatedAt;
    private LocalDateTime recognizedAt;
    private LocalDateTime completedAt;
    private LocalDateTime paidToHostAt;
    private String payoutReference;
}
