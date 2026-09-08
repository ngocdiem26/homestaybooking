package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PublicPromotionResponse {
    private Integer promotionId;
    private String promotionName;
    private String promotionCode;
    private String promotionScope;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String promotionDescription;
    private String status;
    private Integer usageLimitTotal;
    private Integer usedCountTotal;
    private Integer usageLimitPerUser;
    private Integer usedCountByCurrentUser;
    private String tierNames;
    private String homestayNames;
    private Boolean usable;
    private String unavailableReason;
    private String theme;
}
