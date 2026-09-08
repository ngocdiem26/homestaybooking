package com.homestaybooking.controller;

import com.homestaybooking.dto.request.AiItineraryGenerateRequest;
import com.homestaybooking.dto.request.ItineraryUpdateRequest;
import com.homestaybooking.dto.response.ItineraryResponse;
import com.homestaybooking.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/itineraries")
@RequiredArgsConstructor
public class CustomerItineraryController {

    private final ItineraryService itineraryService;

    @PostMapping("/ai-generate")
    public ItineraryResponse generate(
            @RequestBody AiItineraryGenerateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return itineraryService.generate(authorizationHeader, request);
    }

    @GetMapping("/my")
    public List<ItineraryResponse> myItineraries(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return itineraryService.getMyItineraries(authorizationHeader);
    }

    @GetMapping("/{itineraryCode}")
    public ItineraryResponse detail(
            @PathVariable String itineraryCode,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return itineraryService.getDetail(authorizationHeader, itineraryCode);
    }


    @PutMapping("/{itineraryCode}")
    public ItineraryResponse update(
            @PathVariable String itineraryCode,
            @RequestBody ItineraryUpdateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return itineraryService.update(authorizationHeader, itineraryCode, request);
    }
    @DeleteMapping("/{itineraryCode}")
    public Map<String, Object> delete(
            @PathVariable String itineraryCode,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        itineraryService.delete(authorizationHeader, itineraryCode);
        return Map.of("success", true);
    }
}
