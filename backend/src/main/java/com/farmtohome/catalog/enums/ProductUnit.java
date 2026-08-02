package com.farmtohome.catalog.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductUnit {
    KG("kg"),
    GRAM("gram"),
    PIECE("piece"),
    DOZEN("dozen");

    private final String value;

    ProductUnit(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ProductUnit fromValue(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().toLowerCase();
        for (ProductUnit unit : values()) {
            if (unit.value.equals(normalized) || unit.name().toLowerCase().equals(normalized)) {
                return unit;
            }
        }
        throw new IllegalArgumentException("Invalid unit. Allowed values: kg, gram, piece, dozen");
    }
}
