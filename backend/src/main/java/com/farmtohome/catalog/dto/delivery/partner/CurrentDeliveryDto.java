package com.farmtohome.catalog.dto.delivery.partner;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentDeliveryDto {
    private String orderId;
    private String status;
    private String customerName;
    private String customerPhone;
    private String pickupLocation;
    private String deliveryLocation;
    private BigDecimal orderAmount;
    private String paymentMethod;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double deliveryLatitude;
    private Double deliveryLongitude;
    private Double distanceKm;
    private Integer estimatedMinutes;
}
