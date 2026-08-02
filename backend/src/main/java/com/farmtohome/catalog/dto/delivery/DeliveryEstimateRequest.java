package com.farmtohome.catalog.dto.delivery;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
public class DeliveryEstimateRequest {

    @NotNull(message = "originLatitude is required")
    @DecimalMin(value = "-90.0", message = "originLatitude must be >= -90")
    @DecimalMax(value = "90.0", message = "originLatitude must be <= 90")
    private Double originLatitude;

    @NotNull(message = "originLongitude is required")
    @DecimalMin(value = "-180.0", message = "originLongitude must be >= -180")
    @DecimalMax(value = "180.0", message = "originLongitude must be <= 180")
    private Double originLongitude;

    @NotNull(message = "destinationLatitude is required")
    @DecimalMin(value = "-90.0", message = "destinationLatitude must be >= -90")
    @DecimalMax(value = "90.0", message = "destinationLatitude must be <= 90")
    private Double destinationLatitude;

    @NotNull(message = "destinationLongitude is required")
    @DecimalMin(value = "-180.0", message = "destinationLongitude must be >= -180")
    @DecimalMax(value = "180.0", message = "destinationLongitude must be <= 180")
    private Double destinationLongitude;

    @NotNull(message = "preparationMinutes is required")
    @Min(value = 0, message = "preparationMinutes cannot be negative")
    private Integer preparationMinutes;

    public Double getOriginLatitude() {
        return originLatitude;
    }

    public void setOriginLatitude(Double originLatitude) {
        this.originLatitude = originLatitude;
    }

    public Double getOriginLongitude() {
        return originLongitude;
    }

    public void setOriginLongitude(Double originLongitude) {
        this.originLongitude = originLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public Integer getPreparationMinutes() {
        return preparationMinutes;
    }

    public void setPreparationMinutes(Integer preparationMinutes) {
        this.preparationMinutes = preparationMinutes;
    }
}
