package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TierBenefitResponse {

    private Integer tierId;
    private String tierCode;
    private String tierName;
    private Integer minCompletedBookings24m;
    private Integer displayOrder;
    private Boolean unlocked;
    private Boolean current;
    private Integer completedBookings24m;
    private Integer remainingBookings;
    private Integer progressPercent;
    private List<TierPromotionResponse> promotions;
}
