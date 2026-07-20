package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BookingPriceQuoteResponse {
    private Integer homeId;
    private String homestayName;
    private String homestayAddress;
    private String imageUrl;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfNights;
    private Integer numberOfGuest;
    private BigDecimal unitPrice;
    private BigDecimal roomTotal;
    private BigDecimal serviceTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String appliedPromotionCode;
    private List<BookingServiceLineResponse> services;
    private List<BookingPromotionResponse> availablePromotions;
}
