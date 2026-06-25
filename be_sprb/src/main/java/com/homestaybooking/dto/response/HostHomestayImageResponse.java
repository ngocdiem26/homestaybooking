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
public class HostHomestayImageResponse {

    private Integer imageId;
    private String imageUrl;
    private Boolean isMain;
    private Integer sortOrder;
}
