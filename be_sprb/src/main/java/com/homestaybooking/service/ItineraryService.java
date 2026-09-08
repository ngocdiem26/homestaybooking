package com.homestaybooking.service;

import com.homestaybooking.dto.request.AiItineraryGenerateRequest;
import com.homestaybooking.dto.request.ItineraryUpdateRequest;
import com.homestaybooking.dto.response.ItineraryResponse;

import java.util.List;

public interface ItineraryService {
    ItineraryResponse generate(String authorizationHeader, AiItineraryGenerateRequest request);
    List<ItineraryResponse> getMyItineraries(String authorizationHeader);
    ItineraryResponse getDetail(String authorizationHeader, String itineraryCode);
    ItineraryResponse update(String authorizationHeader, String itineraryCode, ItineraryUpdateRequest request);
    void delete(String authorizationHeader, String itineraryCode);
}