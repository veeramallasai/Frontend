package com.farmtohome.catalog.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductUnit {
    KG("kg"),
    HALF_KG("500 g"),
    QUARTER_KG("250 g"),
    GRAM("gram"),
    BUNCH("bunch"),
    PIECE("piece"),
    DOZEN("dozen"),
    LITRE("litre"),
    PACKET("packet");

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
        if (normalized.equals("500g") || normalized.equals("500 g") || normalized.equals("0.5 kg")) {
            return HALF_KG;
        }
        if (normalized.equals("250g") || normalized.equals("250 g") || normalized.equals("0.25 kg")) {
            return QUARTER_KG;
        }
        for (ProductUnit unit : values()) {
            if (unit.value.equals(normalized) || unit.name().toLowerCase().equals(normalized)) {
                return unit;
            }
        }
        throw new IllegalArgumentException("Invalid unit. Allowed values: kg, 500 g, 250 g, gram, bunch, piece, dozen, litre, packet");
    }
}
