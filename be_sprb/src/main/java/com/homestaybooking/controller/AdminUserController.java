package com.homestaybooking.controller;

import com.homestaybooking.dto.request.UpdateUserRoleRequest;
import com.homestaybooking.dto.request.UpdateUserStatusRequest;
import com.homestaybooking.dto.response.AdminUserResponse;
import com.homestaybooking.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponse> getUsers() {
        return adminUserService.getUsers();
    }

    @PatchMapping("/{userId}/status")
    public AdminUserResponse updateStatus(
            @PathVariable Integer userId,
            @RequestBody UpdateUserStatusRequest request
    ) {
        return adminUserService.updateStatus(userId, request);
    }

    @PatchMapping("/{userId}/role")
    public AdminUserResponse updateRole(
            @PathVariable Integer userId,
            @RequestBody UpdateUserRoleRequest request
    ) {
        return adminUserService.updateRole(userId, request);
    }
}
