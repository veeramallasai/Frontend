package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.dto.delivery.partner.CurrentDeliveryDto;
import com.farmtohome.catalog.dto.delivery.partner.DashboardSummaryDto;
import com.farmtohome.catalog.dto.delivery.partner.DeliveryStatusUpdateRequestDto;
import com.farmtohome.catalog.dto.delivery.partner.EarningsPointDto;
import com.farmtohome.catalog.dto.delivery.partner.OnlineStatusRequestDto;
import com.farmtohome.catalog.dto.delivery.partner.RatingsDto;
import com.farmtohome.catalog.dto.delivery.partner.RecentDeliveryDto;
import com.farmtohome.catalog.dto.delivery.partner.UpcomingDeliveryDto;
import com.farmtohome.catalog.service.delivery.DeliveryPartnerDashboardService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/delivery-partner/dashboard")
@RequiredArgsConstructor
public class DeliveryPartnerDashboardController {

    private final DeliveryPartnerDashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Principal principal) {
        return ok(() -> dashboardService.getSummary(principal));
    }

    @GetMapping("/current-delivery")
    public ResponseEntity<?> getCurrentDelivery(Principal principal) {
        return ok(() -> dashboardService.getCurrentDelivery(principal));
    }

    @GetMapping("/upcoming-deliveries")
    public ResponseEntity<?> getUpcomingDeliveries(
        Principal principal,
        @RequestParam(defaultValue = "5") int limit
    ) {
        return ok(() -> dashboardService.getUpcomingDeliveries(principal, limit));
    }

    @GetMapping("/recent-deliveries")
    public ResponseEntity<?> getRecentDeliveries(
        Principal principal,
        @RequestParam(defaultValue = "6") int limit
    ) {
        return ok(() -> dashboardService.getRecentDeliveries(principal, limit));
    }

    @GetMapping("/earnings")
    public ResponseEntity<?> getEarnings(Principal principal) {
        return ok(() -> dashboardService.getEarningsSummary(principal));
    }

    @GetMapping("/ratings")
    public ResponseEntity<?> getRatings(Principal principal) {
        return ok(() -> dashboardService.getRatings(principal));
    }

    @PatchMapping("/online-status")
    public ResponseEntity<?> updateOnlineStatus(
        Principal principal,
        @Valid @RequestBody OnlineStatusRequestDto request
    ) {
        return ok(() -> dashboardService.updateOnlineStatus(principal, request.getStatus()));
    }

    @PatchMapping("/deliveries/{orderId}/status")
    public ResponseEntity<?> updateDeliveryStatus(
        Principal principal,
        @PathVariable("orderId") String orderId,
        @Valid @RequestBody DeliveryStatusUpdateRequestDto request
    ) {
        return ok(() -> dashboardService.updateDeliveryStatus(principal, orderId, request.getStatus()));
    }

    private ResponseEntity<?> ok(ThrowingSupplier<Object> supplier) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", true);
            body.put("data", supplier.get());
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException ex) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success", false);
            body.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
    }

    @FunctionalInterface
    private interface ThrowingSupplier<T> {
        T get();
    }
}
