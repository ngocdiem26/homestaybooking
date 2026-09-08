package com.homestaybooking.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private Integer userId;

    private String fullName;

    private String email;

    private String roleName;

    private String avatar;

    private LocalDate birthday;

    private String token;
}
