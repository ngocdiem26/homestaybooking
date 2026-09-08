package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminPromotionResponse {

    private Integer promotionId;
    private String promotionName;
    private String promotionCode;
    private String promotionScope;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String promotionDescription;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount;
    private Integer usageLimitTotal;
    private Integer usageLimitPerUser;
    private String status;
    private List<Integer> userIds;
    private List<Integer> homeIds;
    private List<Integer> tierIds;
    private List<PromotionTargetOptionResponse> assignedUsers;
    private List<PromotionTargetOptionResponse> assignedHomestays;
    private List<PromotionTargetOptionResponse> assignedTiers;
}
