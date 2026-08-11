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
public class DashboardSummaryDto {
    private String availabilityStatus;
    private long todaysDeliveries;
    private long activeDeliveries;
    private long pendingPickups;
    private long completedToday;
    private BigDecimal todaysEarnings;
    private BigDecimal weeklyEarnings;
}
