package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicActivityResponse {

    private Integer activityId;
    private String activityName;
    private String province;
    private String activityAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String shortDescription;
    private String description;
    private String hotline;
    private String thumbnailUrl;
    private String badgeText;
    private String badgeType;
    private Boolean featured;
    private Integer displayOrder;
    private List<PublicActivityImageResponse> images;
}
