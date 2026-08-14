package com.farmtohome.catalog.dto.delivery.partner;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentDeliveryDto {
    private String orderId;
    private String customerName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime deliveredOn;
}
