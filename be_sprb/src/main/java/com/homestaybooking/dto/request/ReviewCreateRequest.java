package com.homestaybooking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewCreateRequest {
    private Integer bookingId;
    private Integer homeId;
    private Integer rating;
    private String comment;
}
