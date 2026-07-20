package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class HostRevenueBookingResponse {
    private Integer bookingId;
    private String bookingCode;
    private String homestayName;
    private String customerName;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String bookingStatus;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal totalPrice;
    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal discountAmount;
}
