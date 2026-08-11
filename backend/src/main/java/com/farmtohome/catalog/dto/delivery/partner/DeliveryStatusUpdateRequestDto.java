package com.farmtohome.catalog.dto.delivery.partner;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeliveryStatusUpdateRequestDto {

    @NotBlank(message = "Status is required")
    private String status;
}
