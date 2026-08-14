package com.farmtohome.catalog.dto.deliverypartner;

public class FaceVerificationResponse {
    private boolean success;
    private boolean matched;
    private double confidence;
    private String message;

    public FaceVerificationResponse() {}

    public FaceVerificationResponse(boolean success, boolean matched, double confidence, String message) {
        this.success = success;
        this.matched = matched;
        this.confidence = confidence;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
