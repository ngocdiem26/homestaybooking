package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingListItemResponse {
    private Integer bookingId;
    private String bookingCode;
    private Integer customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer hostId;
    private String hostName;
    private String hostEmail;
    private String hostPhone;
    private Integer homeId;
    private String homestayName;
    private String homestayCode;
    private String homestayAddress;
    private String province;
    private String imageUrl;
    private String bookingStatus;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfNights;
    private Integer numberOfGuest;
    private BigDecimal unitPrice;
    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean reviewed;
    private List<BookingServiceLineResponse> services;
}
