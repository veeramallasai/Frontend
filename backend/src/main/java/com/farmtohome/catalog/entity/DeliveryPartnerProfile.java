package com.farmtohome.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "delivery_partner_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserAccount userAccount;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(name = "aadhaar_number", nullable = false, length = 12)
    private String aadhaarNumber;

    @Column(name = "driving_license_number", nullable = false, length = 50)
    private String drivingLicenseNumber;

    @Column(name = "vehicle_type", nullable = false, length = 30)
    private String vehicleType;

    @Column(name = "vehicle_number", nullable = false, length = 30)
    private String vehicleNumber;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(name = "emergency_contact_number", nullable = false, length = 20)
    private String emergencyContactNumber;

    @Column(name = "profile_photo_path", nullable = false, length = 500)
    private String profilePhotoPath;

    @Column(name = "aadhaar_front_path", nullable = false, length = 500)
    private String aadhaarFrontPath;

    @Column(name = "aadhaar_back_path", nullable = false, length = 500)
    private String aadhaarBackPath;

    @Column(name = "driving_license_front_path", nullable = false, length = 500)
    private String drivingLicenseFrontPath;

    @Column(name = "driving_license_back_path", nullable = false, length = 500)
    private String drivingLicenseBackPath;

    @Column(name = "vehicle_rc_book_path", nullable = false, length = 500)
    private String vehicleRcBookPath;

    @Column(name = "vehicle_insurance_path", nullable = false, length = 500)
    private String vehicleInsurancePath;

    @Column(name = "selfie_photo_path", nullable = false, length = 500)
    private String selfiePhotoPath;

    @Column(name = "verification_status", nullable = false, length = 40)
    private String verificationStatus;

    @Column(name = "availability_status", nullable = false, length = 20)
    private String availabilityStatus;

    @Column(name = "account_active", nullable = false)
    private boolean accountActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
