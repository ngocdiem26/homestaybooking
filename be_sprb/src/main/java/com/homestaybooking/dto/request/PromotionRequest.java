package com.homestaybooking.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PromotionRequest {

    private String promotionName;
    private String promotionCode;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String promotionDescription;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private Integer usageLimitTotal;
    private Integer usageLimitPerUser;
    private String status;
}
