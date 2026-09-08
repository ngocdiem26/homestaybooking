package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryUpdateRequest {
    private String itineraryTitle;
    private String summary;
    private List<ItineraryUpdateDayRequest> days = new ArrayList<>();
}