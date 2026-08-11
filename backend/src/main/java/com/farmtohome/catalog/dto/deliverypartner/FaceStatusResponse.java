package com.farmtohome.catalog.dto.deliverypartner;

public class FaceStatusResponse {
    private boolean faceRegistered;
    private boolean faceVerificationEnabled;
    private String message;

    public FaceStatusResponse() {}

    public FaceStatusResponse(boolean faceRegistered, boolean faceVerificationEnabled, String message) {
        this.faceRegistered = faceRegistered;
        this.faceVerificationEnabled = faceVerificationEnabled;
        this.message = message;
    }

    public boolean isFaceRegistered() {
        return faceRegistered;
    }

    public void setFaceRegistered(boolean faceRegistered) {
        this.faceRegistered = faceRegistered;
    }

    public boolean isFaceVerificationEnabled() {
        return faceVerificationEnabled;
    }

    public void setFaceVerificationEnabled(boolean faceVerificationEnabled) {
        this.faceVerificationEnabled = faceVerificationEnabled;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
