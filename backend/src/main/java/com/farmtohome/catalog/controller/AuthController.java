package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.auth.AuthResponseDto;
import com.farmtohome.catalog.dto.auth.LoginRequestDto;
import com.farmtohome.catalog.service.auth.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful.", authService.login(request)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponseDto>> profile(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile loaded successfully.", authService.currentUser(principal)));
    }
}