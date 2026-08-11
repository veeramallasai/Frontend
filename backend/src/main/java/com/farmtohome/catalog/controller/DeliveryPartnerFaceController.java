package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceEnrollmentRequestDto;
import com.farmtohome.catalog.dto.deliverypartner.FaceRegistrationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceStatusResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerificationResponse;
import com.farmtohome.catalog.dto.deliverypartner.FaceVerifyRequestDto;
import com.farmtohome.catalog.security.UserAccountPrincipal;
import com.farmtohome.catalog.service.deliverypartner.DeliveryPartnerFaceService;
import jakarta.validation.Valid;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class DeliveryPartnerFaceController {

    private static final Logger log = LoggerFactory.getLogger(DeliveryPartnerFaceController.class);

    private final DeliveryPartnerFaceService faceService;

    public DeliveryPartnerFaceController(DeliveryPartnerFaceService faceService) {
        this.faceService = faceService;
    }

    // Direct endpoint per specification: GET /api/delivery-partners/me/face-status
    @GetMapping({
        "/api/delivery-partners/me/face-status",
        "/api/v1/delivery-partners/me/face-status"
    })
    public ResponseEntity<FaceStatusResponse> getFaceStatusMe(@AuthenticationPrincipal UserAccountPrincipal principal) {
        log.info("[FACE] Status check requested by delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(faceService.getFaceStatusResponse(principal));
    }

    // Direct endpoint per specification: POST /api/delivery-partners/me/face/register
    @PostMapping(
        value = {
            "/api/delivery-partners/me/face/register",
            "/api/v1/delivery-partners/me/face/register"
        },
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FaceRegistrationResponse> registerFaceMe(
        @AuthenticationPrincipal UserAccountPrincipal principal,
        @RequestParam("faceImage") MultipartFile faceImage
    ) {
        log.info("[FACE] Multipart registration attempt for delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(faceService.registerFace(principal, faceImage));
    }

    // Direct endpoint per specification: POST /api/delivery-partners/me/face/verify
    @PostMapping(
        value = {
            "/api/delivery-partners/me/face/verify",
            "/api/v1/delivery-partners/me/face/verify"
        },
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FaceVerificationResponse> verifyFaceMe(
        @AuthenticationPrincipal UserAccountPrincipal principal,
        @RequestParam("faceImage") MultipartFile faceImage
    ) {
        log.info("[FACE] Multipart verification attempt for delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(faceService.verifyFace(principal, faceImage));
    }

    // Legacy JSON-based routes for backwards compatibility
    @GetMapping("/api/v1/delivery-partner/face/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> statusLegacy(@AuthenticationPrincipal UserAccountPrincipal principal) {
        log.info("[FACE] Legacy status check requested by delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Face status fetched", faceService.getStatus(principal)));
    }

    @PostMapping("/api/v1/delivery-partner/face/enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> enrollLegacy(
        @AuthenticationPrincipal UserAccountPrincipal principal,
        @Valid @RequestBody FaceEnrollmentRequestDto request
    ) {
        log.info("[FACE] Legacy enrollment attempt for delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Face enrollment completed", faceService.enroll(principal, request)));
    }

    @PostMapping("/api/v1/delivery-partner/face/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyLegacy(
        @AuthenticationPrincipal UserAccountPrincipal principal,
        @Valid @RequestBody FaceVerifyRequestDto request
    ) {
        log.info("[FACE] Legacy verification attempt for delivery partner id={}", principal != null ? principal.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Face verification completed", faceService.verify(principal, request)));
    }
}
