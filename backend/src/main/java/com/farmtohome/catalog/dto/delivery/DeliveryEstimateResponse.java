package com.farmtohome.catalog.dto.delivery;

import java.time.LocalDateTime;
public class DeliveryEstimateResponse {

    private Double distanceKm;
    private Integer travelMinutes;
    private Integer preparationMinutes;
    private Integer totalDeliveryMinutes;
    private String estimatedDeliveryText;
    private LocalDateTime estimatedArrivalTime;
    private String formattedArrivalTime;
    private String encodedPolyline;

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getTravelMinutes() {
        return travelMinutes;
    }

    public void setTravelMinutes(Integer travelMinutes) {
        this.travelMinutes = travelMinutes;
    }

    public Integer getPreparationMinutes() {
        return preparationMinutes;
    }

    public void setPreparationMinutes(Integer preparationMinutes) {
        this.preparationMinutes = preparationMinutes;
    }

    public Integer getTotalDeliveryMinutes() {
        return totalDeliveryMinutes;
    }

    public void setTotalDeliveryMinutes(Integer totalDeliveryMinutes) {
        this.totalDeliveryMinutes = totalDeliveryMinutes;
    }

    public String getEstimatedDeliveryText() {
        return estimatedDeliveryText;
    }

    public void setEstimatedDeliveryText(String estimatedDeliveryText) {
        this.estimatedDeliveryText = estimatedDeliveryText;
    }

    public LocalDateTime getEstimatedArrivalTime() {
        return estimatedArrivalTime;
    }

    public void setEstimatedArrivalTime(LocalDateTime estimatedArrivalTime) {
        this.estimatedArrivalTime = estimatedArrivalTime;
    }

    public String getFormattedArrivalTime() {
        return formattedArrivalTime;
    }

    public void setFormattedArrivalTime(String formattedArrivalTime) {
        this.formattedArrivalTime = formattedArrivalTime;
    }

    public String getEncodedPolyline() {
        return encodedPolyline;
    }

    public void setEncodedPolyline(String encodedPolyline) {
        this.encodedPolyline = encodedPolyline;
    }
}
