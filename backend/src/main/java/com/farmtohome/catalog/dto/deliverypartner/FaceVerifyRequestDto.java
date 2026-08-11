package com.farmtohome.catalog.dto.deliverypartner;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class FaceVerifyRequestDto {

    @NotBlank(message = "Captured face image is required")
    private String imageBase64;

    private List<String> completedActions;

    private Double livenessScore;

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public List<String> getCompletedActions() {
        return completedActions;
    }

    public void setCompletedActions(List<String> completedActions) {
        this.completedActions = completedActions;
    }

    public Double getLivenessScore() {
        return livenessScore;
    }

    public void setLivenessScore(Double livenessScore) {
        this.livenessScore = livenessScore;
    }
}
