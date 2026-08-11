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
public class EarningsPointDto {
    private String day;
    private BigDecimal amount;
}
