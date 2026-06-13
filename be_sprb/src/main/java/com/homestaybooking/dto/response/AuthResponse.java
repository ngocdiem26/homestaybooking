package com.homestaybooking.dto.response;

import lombok.*;

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

    private String token;
}