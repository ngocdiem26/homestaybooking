package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentTransactionResponse {
    private String transactionId;
    private Integer bookingId;
    private String bookingCode;
    private String homestayName;
    private BigDecimal amount;
    private String direction;
    private String transactionType;
    private String paymentMethod;
    private String status;
    private String gateway;
    private String referenceCode;
    private String description;
    private LocalDateTime occurredAt;
}