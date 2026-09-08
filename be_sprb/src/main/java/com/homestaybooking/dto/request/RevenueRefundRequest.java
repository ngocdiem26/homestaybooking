package com.homestaybooking.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RevenueRefundRequest {
    private BigDecimal refundAmount;
    private String cancellationType;
    private String adminNote;
}
