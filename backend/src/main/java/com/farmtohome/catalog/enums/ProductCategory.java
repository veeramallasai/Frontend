package com.farmtohome.catalog.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductCategory {
    FRUIT("Fruit"),
    VEGETABLE("Vegetable");

    private final String value;

    ProductCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProductCategory fromValue(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().toLowerCase();
        for (ProductCategory category : values()) {
            if (category.value.toLowerCase().equals(normalized) || category.name().toLowerCase().equals(normalized)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Invalid category. Allowed values: Fruit, Vegetable");
    }
}
