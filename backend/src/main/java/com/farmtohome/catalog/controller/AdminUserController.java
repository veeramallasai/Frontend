package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.auth.AdminUserDto;
import com.farmtohome.catalog.service.auth.AdminUserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getCustomers() {
        List<AdminUserDto> customers = adminUserService.getCustomers();
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getAllUsers() {
        List<AdminUserDto> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }
}
