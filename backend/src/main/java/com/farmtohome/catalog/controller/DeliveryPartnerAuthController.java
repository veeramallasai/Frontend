package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.auth.DeliveryPartnerOtpRequestDto;
import com.farmtohome.catalog.dto.auth.DeliveryPartnerRegistrationRequestDto;
import com.farmtohome.catalog.dto.auth.DeliveryPartnerVerifyOtpRequestDto;
import com.farmtohome.catalog.service.auth.DeliveryPartnerRegistrationService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/delivery-partner/auth")
@Validated
public class DeliveryPartnerAuthController {

    private final DeliveryPartnerRegistrationService registrationService;

    public DeliveryPartnerAuthController(DeliveryPartnerRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendOtp(@Valid @RequestBody DeliveryPartnerOtpRequestDto request) {
        Map<String, Object> data = registrationService.sendOtp(request, false);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", data));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendOtp(@Valid @RequestBody DeliveryPartnerOtpRequestDto request) {
        Map<String, Object> data = registrationService.sendOtp(request, true);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", data));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@Valid @RequestBody DeliveryPartnerVerifyOtpRequestDto request) {
        Map<String, Object> data = registrationService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", data));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @ModelAttribute DeliveryPartnerRegistrationRequestDto request) {
        Map<String, Object> data = registrationService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration Submitted Successfully.", data));
    }
}
