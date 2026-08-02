package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.dto.delivery.DeliveryEstimateRequest;
import com.farmtohome.catalog.dto.delivery.DeliveryEstimateResponse;
import com.farmtohome.catalog.service.DeliveryEstimateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/delivery", "/api/v1/delivery"})
public class DeliveryEstimateController {

    private final DeliveryEstimateService deliveryEstimateService;

    public DeliveryEstimateController(DeliveryEstimateService deliveryEstimateService) {
        this.deliveryEstimateService = deliveryEstimateService;
    }

    @PostMapping("/estimate")
    public ResponseEntity<DeliveryEstimateResponse> estimateDelivery(@Valid @RequestBody DeliveryEstimateRequest request) {
        DeliveryEstimateResponse response = deliveryEstimateService.estimateDelivery(request);
        return ResponseEntity.ok(response);
    }
}
