package com.homestaybooking.controller;

import com.homestaybooking.dto.request.SearchHistoryRequest;
import com.homestaybooking.dto.response.SearchHistoryResponse;
import com.homestaybooking.service.SearchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/search-history")
@RequiredArgsConstructor
public class SearchHistoryController {
    private final SearchHistoryService searchHistoryService;

    @GetMapping
    public List<SearchHistoryResponse> getMySearchHistory(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return searchHistoryService.getMySearchHistory(authorizationHeader);
    }

    @PostMapping
    public List<SearchHistoryResponse> saveMySearchHistory(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody(required = false) SearchHistoryRequest request
    ) {
        return searchHistoryService.saveMySearchHistory(authorizationHeader, request);
    }

    @DeleteMapping("/{searchId}")
    public List<SearchHistoryResponse> removeMySearchHistory(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable Integer searchId
    ) {
        return searchHistoryService.removeMySearchHistory(authorizationHeader, searchId);
    }

    @DeleteMapping("/keyword/{keyword}")
    public List<SearchHistoryResponse> removeMySearchHistoryByKeyword(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable String keyword
    ) {
        return searchHistoryService.removeMySearchHistoryByKeyword(authorizationHeader, keyword);
    }

    @DeleteMapping
    public List<SearchHistoryResponse> clearMySearchHistory(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return searchHistoryService.clearMySearchHistory(authorizationHeader);
    }
}
