package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HostHomestayImageRequest {

    private Integer imageId;
    private String imageUrl;
    private Boolean isMain;
    private Integer sortOrder;
}
