package com.homestaybooking.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VnpayWebhookRequest {
    private String transactionCode;
    private BigDecimal amount;
    private LocalDateTime paidAt;
    private String bankCode;
    private String responseCode;
    private String orderInfo;
}
