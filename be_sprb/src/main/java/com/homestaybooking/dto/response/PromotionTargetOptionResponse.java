package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PromotionTargetOptionResponse {

    private Integer id;
    private String code;
    private String label;
    private String subLabel;
}
