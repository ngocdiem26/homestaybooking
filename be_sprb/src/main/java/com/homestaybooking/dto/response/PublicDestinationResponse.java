package com.homestaybooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicDestinationResponse {

    private Integer destinationId;
    private String provinceName;
    private String displayName;
    private String slug;
    private String description;
    private String thumbnailUrl;
    private Integer displayOrder;
    private Long homestayCount;
}
