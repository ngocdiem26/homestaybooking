package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PromotionTargetOptionsResponse {

    private List<PromotionTargetOptionResponse> users;
    private List<PromotionTargetOptionResponse> homestays;
    private List<PromotionTargetOptionResponse> tiers;
}
