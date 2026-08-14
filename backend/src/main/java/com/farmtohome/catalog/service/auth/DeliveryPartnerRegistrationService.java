package com.farmtohome.catalog.service.auth;

import com.farmtohome.catalog.dto.auth.DeliveryPartnerOtpRequestDto;
import com.farmtohome.catalog.dto.auth.DeliveryPartnerRegistrationRequestDto;
import com.farmtohome.catalog.dto.auth.DeliveryPartnerVerifyOtpRequestDto;
import com.farmtohome.catalog.entity.DeliveryPartnerEmailOtp;
import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.exception.FileStorageException;
import com.farmtohome.catalog.exception.TooManyOtpRequestsException;
import com.farmtohome.catalog.repository.DeliveryPartnerEmailOtpRepository;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class DeliveryPartnerRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryPartnerRegistrationService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf"
    );
    private static final String DOCUMENT_NOT_PROVIDED = "NOT_PROVIDED";

    private final DeliveryPartnerEmailOtpRepository otpRepository;
    private final DeliveryPartnerProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.upload.delivery-partner-dir:uploads/delivery-partners}")
    private String uploadDirectoryPath;

    @Value("${app.mail.from:no-reply@farmtohome.com}")
    private String mailFrom;

    @Value("${app.delivery-partner.otp.expose-in-response:false}")
    private boolean exposeOtpInResponse;

    private final Environment environment;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public Map<String, Object> sendOtp(DeliveryPartnerOtpRequestDto request, boolean isResend) {
        String email = normalizeEmail(request.getEmail());

        validateEmailEligibility(email);
        validateOtpRateLimits(email);

        String otp = generateOtp();
        DeliveryPartnerEmailOtp otpRecord = DeliveryPartnerEmailOtp.builder()
            .email(email)
            .otpCode(otp)
            .used(false)
            .verified(false)
            .expiresAt(LocalDateTime.now().plusMinutes(5))
            .build();

        otpRepository.save(otpRecord);
        sendOtpEmail(email, otp);

        Map<String, Object> result = new HashMap<>();
        result.put("email", email);
        result.put("expiresInSeconds", 300);
        result.put("resendCooldownSeconds", 60);
        result.put("resend", isResend);
        if (shouldExposeOtpInResponse()) {
            result.put("otpCode", otp);
            log.warn("DEV OTP exposure is enabled. Email: {} OTP: {}", email, otp);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> verifyOtp(DeliveryPartnerVerifyOtpRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        String otp = String.valueOf(request.getOtp()).trim();

        DeliveryPartnerEmailOtp latestOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new IllegalArgumentException("Invalid OTP"));

        if (latestOtp.isUsed()) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        if (LocalDateTime.now().isAfter(latestOtp.getExpiresAt())) {
            throw new IllegalArgumentException("OTP expired");
        }

        if (!Objects.equals(latestOtp.getOtpCode(), otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        latestOtp.setUsed(true);
        latestOtp.setVerified(true);
        latestOtp.setUsedAt(LocalDateTime.now());
        latestOtp.setVerifiedAt(LocalDateTime.now());
        otpRepository.save(latestOtp);

        Map<String, Object> result = new HashMap<>();
        result.put("email", email);
        result.put("verified", true);
        return result;
    }

    @Transactional
    public Map<String, Object> register(DeliveryPartnerRegistrationRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        String mobile = digitsOnly(request.getMobileNumber());

        validateRegistrationUniqueness(email, mobile);
        validateEmailVerified(email);

        Path uploadBase = Paths.get(uploadDirectoryPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadBase);
        } catch (IOException ex) {
            throw new FileStorageException("Failed to prepare upload directory", ex);
        }

        String profilePhotoPath = storeOptionalFile(uploadBase, request.getProfilePhoto(), "profile-photo");
        String aadhaarFrontPath = storeOptionalFile(uploadBase, request.getAadhaarFront(), "aadhaar-front");
        String aadhaarBackPath = storeOptionalFile(uploadBase, request.getAadhaarBack(), "aadhaar-back");
        String dlFrontPath = storeOptionalFile(uploadBase, request.getDrivingLicenseFront(), "dl-front");
        String dlBackPath = storeOptionalFile(uploadBase, request.getDrivingLicenseBack(), "dl-back");
        String rcBookPath = storeOptionalFile(uploadBase, request.getVehicleRcBook(), "rc-book");
        String insurancePath = storeOptionalFile(uploadBase, request.getVehicleInsurance(), "vehicle-insurance");
        String selfiePath = storeOptionalFile(uploadBase, request.getSelfiePhoto(), "selfie");

        String[] nameParts = splitName(request.getFullName());

        UserAccount userAccount = UserAccount.builder()
            .firstName(nameParts[0])
            .lastName(nameParts[1])
            .email(email)
            .phoneNumber(mobile)
            .password(passwordEncoder.encode(request.getPassword()))
            .role(UserRole.DELIVERY_PARTNER)
            .build();

        UserAccount savedUser = userRepository.save(userAccount);

        DeliveryPartnerProfile profile = DeliveryPartnerProfile.builder()
            .userAccount(savedUser)
            .fullName(request.getFullName().trim())
            .dateOfBirth(request.getDateOfBirth())
            .gender(request.getGender().trim().toUpperCase())
            .aadhaarNumber(digitsOnly(request.getAadhaarNumber()))
            .drivingLicenseNumber(request.getDrivingLicenseNumber().trim())
            .vehicleType(request.getVehicleType().trim().toUpperCase())
            .vehicleNumber(request.getVehicleNumber().trim())
            .address(request.getAddress().trim())
            .city(request.getCity().trim())
            .state(request.getState().trim())
            .pincode(digitsOnly(request.getPincode()))
            .emergencyContactNumber(digitsOnly(request.getEmergencyContactNumber()))
            .profilePhotoPath(profilePhotoPath)
            .aadhaarFrontPath(aadhaarFrontPath)
            .aadhaarBackPath(aadhaarBackPath)
            .drivingLicenseFrontPath(dlFrontPath)
            .drivingLicenseBackPath(dlBackPath)
            .vehicleRcBookPath(rcBookPath)
            .vehicleInsurancePath(insurancePath)
            .selfiePhotoPath(selfiePath)
            .verificationStatus("PENDING_ADMIN_VERIFICATION")
            .availabilityStatus("OFFLINE")
            .accountActive(true)
            .build();

        profileRepository.save(profile);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", savedUser.getId());
        result.put("email", email);
        result.put("status", "PENDING_ADMIN_VERIFICATION");
        return result;
    }

    private void validateEmailEligibility(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(existingUser -> {
            if (existingUser.getRole() == UserRole.DELIVERY_PARTNER) {
                throw new IllegalArgumentException("Email already registered as Delivery Partner");
            }
            throw new IllegalArgumentException("Email already registered");
        });
    }

    private void validateOtpRateLimits(String email) {
        LocalDateTime now = LocalDateTime.now();

        otpRepository.findTopByEmailOrderByCreatedAtDesc(email).ifPresent(lastOtp -> {
            long elapsedSeconds = ChronoUnit.SECONDS.between(lastOtp.getCreatedAt(), now);
            if (elapsedSeconds < 60) {
                throw new IllegalArgumentException("Please wait before requesting another OTP");
            }
        });

        long recentCount = otpRepository.countByEmailAndCreatedAtAfter(email, now.minusMinutes(15));
        if (recentCount >= 5) {
            throw new TooManyOtpRequestsException("Too many OTP requests");
        }
    }

    private void validateRegistrationUniqueness(String email, String mobile) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (userRepository.existsByPhoneNumber(mobile)) {
            throw new IllegalArgumentException("Mobile number already registered");
        }
    }

    private void validateEmailVerified(String email) {
        DeliveryPartnerEmailOtp latestOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new IllegalArgumentException("Please verify your email using OTP before creating account"));

        if (!latestOtp.isVerified()) {
            throw new IllegalArgumentException("Please verify your email using OTP before creating account");
        }
    }

    private String storeFile(Path uploadBase, MultipartFile file, String label) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException(label + " file is required");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new FileStorageException("Only JPG, JPEG, PNG, and PDF files are allowed");
        }

        String extension = resolveExtension(file.getOriginalFilename());
        String fileName = label + "-" + UUID.randomUUID() + extension;
        Path targetPath = uploadBase.resolve(fileName).normalize();

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return uploadBase.getFileName() + "/" + fileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to upload " + label + " file", ex);
        }
    }

    private String storeOptionalFile(Path uploadBase, MultipartFile file, String label) {
        if (file == null || file.isEmpty()) {
            return DOCUMENT_NOT_PROVIDED;
        }
        return storeFile(uploadBase, file, label);
    }

    private String normalizeEmail(String email) {
        return String.valueOf(email == null ? "" : email).trim().toLowerCase();
    }

    private String digitsOnly(String value) {
        return String.valueOf(value == null ? "" : value).replaceAll("\\D", "");
    }

    private String generateOtp() {
        int number = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    private String[] splitName(String fullName) {
        String safe = String.valueOf(fullName == null ? "" : fullName).trim().replaceAll("\\s+", " ");
        if (safe.isEmpty()) {
            return new String[] {"Delivery", "Partner"};
        }

        String[] parts = safe.split(" ");
        if (parts.length == 1) {
            return new String[] {parts[0], "Partner"};
        }

        return new String[] {parts[0], safe.substring(parts[0].length()).trim()};
    }

    private String resolveExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        if (ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".pdf")) {
            return ext;
        }
        return "";
    }

    private void sendOtpEmail(String email, String otpCode) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom(mailFrom);
        mailMessage.setTo(email);
        mailMessage.setSubject("Farm2Home Delivery Partner Email Verification OTP");
        mailMessage.setText(
            "Your Farm2Home Delivery Partner verification OTP is: " + otpCode + "\n\n"
                + "This OTP is valid for 5 minutes and can be used only once."
        );

        try {
            mailSender.send(mailMessage);
            log.info("OTP email dispatch accepted for {}", email);
        } catch (MailException ex) {
            throw new IllegalArgumentException("Failed to send OTP");
        }
    }

    private boolean shouldExposeOtpInResponse() {
        if (exposeOtpInResponse) {
            return true;
        }

        return java.util.Arrays.stream(environment.getActiveProfiles())
            .anyMatch(profile -> "dev".equalsIgnoreCase(profile) || "local".equalsIgnoreCase(profile));
    }
}
