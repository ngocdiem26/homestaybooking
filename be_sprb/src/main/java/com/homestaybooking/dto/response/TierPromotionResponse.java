package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierPromotionResponse {

    private Integer promotionId;
    private String promotionName;
    private String promotionCode;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String theme;
    private Boolean usedByCurrentUser;
    private LocalDateTime userValidFrom;
    private LocalDateTime userValidUntil;
    private String userPromotionStatus;
    private Integer usageLimit;
    private Integer usedCount;
}
