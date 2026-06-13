package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {

    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private LocalDate birthday;
    private String gender;
    private String userStatus;
    private String avatar;
    private String roleName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
