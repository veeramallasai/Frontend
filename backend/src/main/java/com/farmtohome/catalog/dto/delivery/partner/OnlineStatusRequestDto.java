package com.farmtohome.catalog.dto.delivery.partner;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OnlineStatusRequestDto {

    @NotBlank(message = "Status is required")
    private String status;
}
