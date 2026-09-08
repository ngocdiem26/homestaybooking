package com.homestaybooking.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PromotionRequest {

    private String promotionName;
    private String promotionCode;
    private String promotionScope;
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
    private List<Integer> userIds;
    private List<String> userCodes;
    private List<Integer> homeIds;
    private List<String> homeCodes;
    private List<Integer> tierIds;
}
