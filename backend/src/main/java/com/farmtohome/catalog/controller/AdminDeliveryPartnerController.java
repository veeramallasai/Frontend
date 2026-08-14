package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.deliverypartner.AdminAssignOrderRequestDto;
import com.farmtohome.catalog.dto.deliverypartner.AdminDeliveryPartnerDto;
import com.farmtohome.catalog.entity.DeliveryTask;
import com.farmtohome.catalog.service.delivery.AdminDeliveryPartnerService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDeliveryPartnerController {

    private final AdminDeliveryPartnerService adminService;

    @GetMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<List<AdminDeliveryPartnerDto>>> getAllDeliveryPartners() {
        List<AdminDeliveryPartnerDto> partners = adminService.getAllDeliveryPartners();
        return ResponseEntity.ok(ApiResponse.success("Delivery partners retrieved successfully", partners));
    }

    @GetMapping("/delivery-partners/pending")
    public ResponseEntity<ApiResponse<List<AdminDeliveryPartnerDto>>> getPendingDeliveryPartners() {
        List<AdminDeliveryPartnerDto> pending = adminService.getPendingDeliveryPartners();
        return ResponseEntity.ok(ApiResponse.success("Pending delivery partners retrieved successfully", pending));
    }

    @PostMapping("/users/{userId}/assign-delivery-role")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> assignDeliveryRole(@PathVariable("userId") Long userId) {
        AdminDeliveryPartnerDto partner = adminService.assignDeliveryRole(userId);
        return ResponseEntity.ok(ApiResponse.success("Assigned ROLE_DELIVERY_PARTNER and approved user successfully", partner));
    }

    @PostMapping("/delivery-partners/{id}/approve")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> approvePartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.approvePartner(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner approved successfully", partner));
    }

    @PostMapping({"/delivery-partners/{id}/reject", "/reject-delivery-partner/{id}"})
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> rejectPartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.rejectPartner(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner rejected", partner));
    }

    @PostMapping("/delivery-partners/{id}/activate")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> activatePartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.setPartnerActive(id, true);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner activated", partner));
    }

    @PostMapping("/delivery-partners/{id}/deactivate")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> deactivatePartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.setPartnerActive(id, false);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner deactivated", partner));
    }

    @PostMapping("/delivery-partners/{id}/block")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> blockPartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.setPartnerBlocked(id, true);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner blocked", partner));
    }

    @PostMapping("/delivery-partners/{id}/unblock")
    public ResponseEntity<ApiResponse<AdminDeliveryPartnerDto>> unblockPartner(@PathVariable("id") Long id) {
        AdminDeliveryPartnerDto partner = adminService.setPartnerBlocked(id, false);
        return ResponseEntity.ok(ApiResponse.success("Delivery partner unblocked", partner));
    }

    @PostMapping("/orders/assign")
    public ResponseEntity<ApiResponse<DeliveryTask>> assignOrder(@Valid @RequestBody AdminAssignOrderRequestDto request) {
        DeliveryTask task = adminService.assignOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Order assigned to delivery partner successfully", task));
    }
}
