package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Integer bookingId;
    private Integer paymentId;
    private String bookingCode;
    private String bookingStatus;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal amount;
    private String transactionCode;
    private String qrCodeUrl;
    private String paymentUrl;
    private LocalDateTime expiresAt;
    private BookingPriceQuoteResponse quote;
}
