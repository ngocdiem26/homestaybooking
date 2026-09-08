package com.homestaybooking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiItineraryGenerateRequest {
    private String destinationKeyword;
    private String city;
    private String province;
    private LocalDate startDate;
    private Integer totalDays;
    private Integer travelerCount;
    private String travelStyle;
    private String pace;
    private List<String> interests = new ArrayList<>();
    private List<Integer> activityIds = new ArrayList<>();
    private Integer selectedHomeId;
    private List<CustomPlaceRequest> customPlaces = new ArrayList<>();
    private String note;
}