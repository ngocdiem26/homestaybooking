package com.homestaybooking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewUpdateRequest {
    private Integer rating;
    private String comment;
}
