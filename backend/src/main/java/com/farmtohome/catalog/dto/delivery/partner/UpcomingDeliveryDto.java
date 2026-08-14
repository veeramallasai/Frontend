package com.farmtohome.catalog.dto.delivery.partner;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingDeliveryDto {
    private String orderId;
    private String customerName;
    private String location;
    private LocalDateTime scheduledTime;
    private String status;
}
