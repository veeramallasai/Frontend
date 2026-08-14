package com.farmtohome.catalog.dto.delivery.partner;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingsDto {
    private double overallRating;
    private long totalRatings;
    private Map<Integer, Long> distribution;
}
