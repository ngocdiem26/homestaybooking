package com.homestaybooking.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate birthday;
    private String address;
    private String gender;
    private String avatar;
    private String roleName;
}
