package com.farmtohome.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partner_face_profiles")
public class DeliveryPartnerFaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "template_hash", nullable = false, length = 512)
    private String templateHash;

    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;

    @Column(name = "verified_until")
    private LocalDateTime verifiedUntil;

    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts;

    @Column(name = "face_registered")
    private Boolean faceRegistered = true;

    @Column(name = "face_verification_enabled")
    private Boolean faceVerificationEnabled = true;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (enrolledAt == null) {
            enrolledAt = now;
        }
        if (failedAttempts == null) {
            failedAttempts = 0;
        }
        if (faceRegistered == null) {
            faceRegistered = true;
        }
        if (faceVerificationEnabled == null) {
            faceVerificationEnabled = true;
        }
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTemplateHash() {
        return templateHash;
    }

    public void setTemplateHash(String templateHash) {
        this.templateHash = templateHash;
    }

    public String getFaceTemplate() {
        return templateHash;
    }

    public void setFaceTemplate(String faceTemplate) {
        this.templateHash = faceTemplate;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getFaceRegisteredAt() {
        return enrolledAt;
    }

    public void setFaceRegisteredAt(LocalDateTime faceRegisteredAt) {
        this.enrolledAt = faceRegisteredAt;
    }

    public LocalDateTime getLastVerifiedAt() {
        return lastVerifiedAt;
    }

    public void setLastVerifiedAt(LocalDateTime lastVerifiedAt) {
        this.lastVerifiedAt = lastVerifiedAt;
    }

    public LocalDateTime getLastFaceVerifiedAt() {
        return lastVerifiedAt;
    }

    public void setLastFaceVerifiedAt(LocalDateTime lastFaceVerifiedAt) {
        this.lastVerifiedAt = lastFaceVerifiedAt;
    }

    public LocalDateTime getVerifiedUntil() {
        return verifiedUntil;
    }

    public void setVerifiedUntil(LocalDateTime verifiedUntil) {
        this.verifiedUntil = verifiedUntil;
    }

    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public Boolean getFaceRegistered() {
        return faceRegistered != null ? faceRegistered : true;
    }

    public void setFaceRegistered(Boolean faceRegistered) {
        this.faceRegistered = faceRegistered;
    }

    public Boolean getFaceVerificationEnabled() {
        return faceVerificationEnabled != null ? faceVerificationEnabled : true;
    }

    public void setFaceVerificationEnabled(Boolean faceVerificationEnabled) {
        this.faceVerificationEnabled = faceVerificationEnabled;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
