package com.farmtohome.catalog.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    OUT_OF_STOCK("Out of Stock"),
    DISCONTINUED("Discontinued");

    private final String value;

    ProductStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProductStatus fromValue(String raw) {
        if (raw == null) {
            return null;
        }

        String normalized = raw.trim().toLowerCase().replace('-', ' ').replace('_', ' ');
        for (ProductStatus status : values()) {
            if (status.value.toLowerCase().equals(normalized) || status.name().toLowerCase().replace('_', ' ').equals(normalized)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Invalid product status");
    }
}