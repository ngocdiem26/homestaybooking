package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingPaymentStatusResponse {
    private Integer bookingId;
    private String bookingCode;
    private String bookingStatus;
    private String paymentStatus;
    private LocalDateTime paidAt;
    private LocalDateTime expiresAt;
}
