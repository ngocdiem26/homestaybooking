package com.homestaybooking.dto.request;

import lombok.Data;

@Data
public class BookingCreateRequest extends BookingQuoteRequest {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String note;
    private String paymentMethod;
}
