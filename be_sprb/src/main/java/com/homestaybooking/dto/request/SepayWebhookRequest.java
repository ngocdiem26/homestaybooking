package com.homestaybooking.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SepayWebhookRequest {
    private String transactionCode;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private String content;
}
