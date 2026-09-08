package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class MaintenancePaymentRequest {
    private String paymentMethod;
    private String transactionReference;
    private String adminNote;
}
