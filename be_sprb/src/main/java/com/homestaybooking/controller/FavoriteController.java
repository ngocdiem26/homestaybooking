package com.homestaybooking.controller;

import com.homestaybooking.dto.response.PublicHomestayResponse;
import com.homestaybooking.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public List<PublicHomestayResponse> getFavorites(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return favoriteService.getFavorites(authorizationHeader);
    }

    @GetMapping("/ids")
    public List<Integer> getFavoriteIds(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return favoriteService.getFavoriteIds(authorizationHeader);
    }

    @GetMapping("/recommendations")
    public List<PublicHomestayResponse> getRecommendations(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return favoriteService.getRecommendations(authorizationHeader);
    }

    @PostMapping("/{homeId}")
    public List<Integer> addFavorite(
            @PathVariable Integer homeId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return favoriteService.addFavorite(homeId, authorizationHeader);
    }

    @DeleteMapping("/{homeId}")
    public List<Integer> removeFavorite(
            @PathVariable Integer homeId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        return favoriteService.removeFavorite(homeId, authorizationHeader);
    }
}
