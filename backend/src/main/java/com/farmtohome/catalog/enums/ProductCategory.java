package com.farmtohome.catalog.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ProductCategory {
    VEGETABLE("Vegetables"),
    FRUIT("Fruits"),
    LEAFY_VEGETABLE("Leafy Vegetables"),
    HERB("Herbs"),
    GRAIN_AND_RICE("Grains and Rice"),
    PULSE_AND_DAL("Pulses and Dal"),
    SPICE("Spices"),
    DRY_FRUIT_AND_NUTS("Dry Fruits and Nuts"),
    DAIRY_PRODUCTS("Dairy Products"),
    EGGS_AND_POULTRY("Eggs and Poultry"),
    ORGANIC_PRODUCTS("Organic Products");

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
        String normalized = raw.trim().toLowerCase().replace('-', ' ').replace('_', ' ');
        for (ProductCategory category : values()) {
            String categoryValue = category.value.toLowerCase();
            String categoryName = category.name().toLowerCase().replace('_', ' ');
            if (categoryValue.equals(normalized) || categoryName.equals(normalized)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Invalid category. Allowed values: Vegetables, Fruits, Leafy Vegetables, Herbs, Grains and Rice, Pulses and Dal, Spices, Dry Fruits and Nuts, Dairy Products, Eggs and Poultry, Organic Products");
    }
}
