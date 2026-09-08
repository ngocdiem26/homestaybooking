package com.homestaybooking.controller;

import com.homestaybooking.dto.request.UpdateAvatarRequest;
import com.homestaybooking.dto.request.UpdateProfileRequest;
import com.homestaybooking.dto.response.UserProfileResponse;
import com.homestaybooking.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        return userProfileService.getMyProfile(authorizationHeader);
    }

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody UpdateProfileRequest request
    ) {
        return userProfileService.updateMyProfile(authorizationHeader, request);
    }
    @PutMapping("/me/avatar")
    public UserProfileResponse updateMyAvatar(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody UpdateAvatarRequest request
    ) {
        return userProfileService.updateMyAvatar(authorizationHeader, request == null ? null : request.getAvatar());
    }
}
