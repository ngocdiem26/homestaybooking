package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BookingPromotionResponse {
    private Integer promotionId;
    private String promotionName;
    private String promotionCode;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private BigDecimal estimatedDiscount;
    private LocalDate endDate;
}
