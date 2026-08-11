package com.farmtohome.catalog.dto.deliverypartner;

import jakarta.validation.constraints.NotBlank;

public class FaceEnrollmentRequestDto {

    @NotBlank(message = "Captured face image is required")
    private String imageBase64;

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
