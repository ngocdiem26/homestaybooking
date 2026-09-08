package com.homestaybooking.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {

    private String fullName;

    private String email;

    private String password;

    private String phoneNumber;

    private LocalDate birthday;

    private String gender;

    private String address;

    private String roleName;
}