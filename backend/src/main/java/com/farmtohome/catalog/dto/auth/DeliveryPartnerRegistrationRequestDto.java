package com.farmtohome.catalog.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DeliveryPartnerRegistrationRequestDto {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must contain exactly 10 digits")
    private String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Date of birth is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must contain exactly 12 digits")
    private String aadhaarNumber;

    @NotBlank(message = "Driving license number is required")
    private String drivingLicenseNumber;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must contain exactly 6 digits")
    private String pincode;

    @NotBlank(message = "Emergency contact number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Emergency contact number must contain exactly 10 digits")
    private String emergencyContactNumber;

    private MultipartFile profilePhoto;

    private MultipartFile aadhaarFront;

    private MultipartFile aadhaarBack;

    private MultipartFile drivingLicenseFront;

    private MultipartFile drivingLicenseBack;

    private MultipartFile vehicleRcBook;

    private MultipartFile vehicleInsurance;

    private MultipartFile selfiePhoto;
}
