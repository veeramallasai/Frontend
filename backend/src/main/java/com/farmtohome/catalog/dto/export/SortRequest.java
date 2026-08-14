package com.farmtohome.catalog.dto.export;

public record SortRequest(
    String column,
    String direction
) {
}
