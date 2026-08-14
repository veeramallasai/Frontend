package com.farmtohome.catalog.service.delivery;

import com.farmtohome.catalog.dto.deliverypartner.AdminAssignOrderRequestDto;
import com.farmtohome.catalog.dto.deliverypartner.AdminDeliveryPartnerDto;
import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.DeliveryTask;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.DeliveryTaskStatus;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.DeliveryTaskRepository;
import com.farmtohome.catalog.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminDeliveryPartnerService {

    private final DeliveryPartnerProfileRepository profileRepository;
    private final DeliveryTaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminDeliveryPartnerDto> getAllDeliveryPartners() {
        List<DeliveryPartnerProfile> profiles = profileRepository.findAll();
        List<AdminDeliveryPartnerDto> result = new ArrayList<>();
        Set<Long> processedUserIds = new HashSet<>();

        for (DeliveryPartnerProfile profile : profiles) {
            result.add(mapToDto(profile));
            if (profile.getUserAccount() != null) {
                processedUserIds.add(profile.getUserAccount().getId());
            } else if (profile.getUserId() != null) {
                processedUserIds.add(profile.getUserId());
            }
        }

        // Also check UserAccount repository for any user with role DELIVERY_PARTNER missing profile
        List<UserAccount> partnerUsers = userRepository.findByRole(UserRole.DELIVERY_PARTNER);
        for (UserAccount user : partnerUsers) {
            if (!processedUserIds.contains(user.getId())) {
                AdminDeliveryPartnerDto dto = new AdminDeliveryPartnerDto();
                dto.setId(user.getId());
                dto.setUserId(user.getId());
                String fullName = (user.getFirstName() != null ? user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "") : user.getEmail()).trim();
                dto.setFullName(fullName);
                dto.setEmail(user.getEmail());
                dto.setPhone(user.getPhoneNumber());
                dto.setVerificationStatus("APPROVED");
                dto.setAvailabilityStatus("OFFLINE");
                dto.setAccountActive(true);
                dto.setVehicleType("Motorbike");
                dto.setVehicleNumber("MH 15 AB 1234");
                dto.setCity("Nashik");
                dto.setState("Maharashtra");
                dto.setCreatedAt(user.getCreatedAt());
                result.add(dto);
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<AdminDeliveryPartnerDto> getPendingDeliveryPartners() {
        List<DeliveryPartnerProfile> profiles = profileRepository.findAll();
        List<AdminDeliveryPartnerDto> result = new ArrayList<>();

        for (DeliveryPartnerProfile profile : profiles) {
            if ("PENDING_ADMIN_VERIFICATION".equalsIgnoreCase(profile.getVerificationStatus()) ||
                "PENDING".equalsIgnoreCase(profile.getVerificationStatus()) ||
                !profile.isAccountActive()) {
                result.add(mapToDto(profile));
            }
        }

        return result;
    }

    public AdminDeliveryPartnerDto assignDeliveryRole(Long userId) {
        UserAccount user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User account not found with ID: " + userId));

        user.setRole(UserRole.DELIVERY_PARTNER);
        userRepository.save(user);

        DeliveryPartnerProfile profile = profileRepository.findByUserAccountId(user.getId())
            .orElseGet(() -> DeliveryPartnerProfile.builder()
                .userAccount(user)
                .fullName((user.getFirstName() != null ? user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "") : user.getEmail()).trim())
                .dateOfBirth(LocalDate.of(1995, 1, 1))
                .gender("MALE")
                .aadhaarNumber("987654321012")
                .drivingLicenseNumber("DL-REF-998877")
                .vehicleType("MOTORBIKE")
                .vehicleNumber("MH15AB1234")
                .address("Hub Zone, Main Address")
                .city("Nashik")
                .state("Maharashtra")
                .pincode("422001")
                .emergencyContactNumber("9876543210")
                .profilePhotoPath("NOT_PROVIDED")
                .aadhaarFrontPath("NOT_PROVIDED")
                .aadhaarBackPath("NOT_PROVIDED")
                .drivingLicenseFrontPath("NOT_PROVIDED")
                .drivingLicenseBackPath("NOT_PROVIDED")
                .vehicleRcBookPath("NOT_PROVIDED")
                .vehicleInsurancePath("NOT_PROVIDED")
                .selfiePhotoPath("NOT_PROVIDED")
                .verificationStatus("APPROVED")
                .availabilityStatus("OFFLINE")
                .accountActive(true)
                .build());

        profile.setVerificationStatus("APPROVED");
        profile.setAccountActive(true);
        profileRepository.save(profile);

        return mapToDto(profile);
    }

    public AdminDeliveryPartnerDto approvePartner(Long id) {
        DeliveryPartnerProfile profile = getProfileById(id);
        profile.setVerificationStatus("APPROVED");
        profile.setAccountActive(true);
        profileRepository.save(profile);

        UserAccount user = profile.getUserAccount();
        if (user != null && user.getRole() != UserRole.DELIVERY_PARTNER) {
            user.setRole(UserRole.DELIVERY_PARTNER);
            userRepository.save(user);
        }

        return mapToDto(profile);
    }

    public AdminDeliveryPartnerDto rejectPartner(Long id) {
        DeliveryPartnerProfile profile = getProfileById(id);
        profile.setVerificationStatus("REJECTED");
        profileRepository.save(profile);
        return mapToDto(profile);
    }

    public AdminDeliveryPartnerDto setPartnerActive(Long id, boolean active) {
        DeliveryPartnerProfile profile = getProfileById(id);
        profile.setAccountActive(active);
        profileRepository.save(profile);
        return mapToDto(profile);
    }

    public AdminDeliveryPartnerDto setPartnerBlocked(Long id, boolean blocked) {
        DeliveryPartnerProfile profile = getProfileById(id);
        if (blocked) {
            profile.setVerificationStatus("BLOCKED");
            profile.setAccountActive(false);
        } else {
            profile.setVerificationStatus("APPROVED");
            profile.setAccountActive(true);
        }
        profileRepository.save(profile);
        return mapToDto(profile);
    }

    public DeliveryTask assignOrder(AdminAssignOrderRequestDto request) {
        DeliveryPartnerProfile profile = profileRepository.findById(request.getDeliveryPartnerId())
            .or(() -> profileRepository.findByUserAccountId(request.getDeliveryPartnerId()))
            .orElseGet(() -> {
                UserAccount u = userRepository.findById(request.getDeliveryPartnerId())
                    .orElseThrow(() -> new IllegalArgumentException("Delivery partner not found with ID: " + request.getDeliveryPartnerId()));
                return profileRepository.save(DeliveryPartnerProfile.builder()
                    .userAccount(u)
                    .fullName((u.getFirstName() != null ? u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "") : u.getEmail()).trim())
                    .dateOfBirth(LocalDate.of(1995, 1, 1))
                    .gender("MALE")
                    .aadhaarNumber("987654321012")
                    .drivingLicenseNumber("DL-REF-998877")
                    .vehicleType("MOTORBIKE")
                    .vehicleNumber("MH15AB1234")
                    .address("Hub Zone, Main Address")
                    .city("Nashik")
                    .state("Maharashtra")
                    .pincode("422001")
                    .emergencyContactNumber("9876543210")
                    .profilePhotoPath("NOT_PROVIDED")
                    .aadhaarFrontPath("NOT_PROVIDED")
                    .aadhaarBackPath("NOT_PROVIDED")
                    .drivingLicenseFrontPath("NOT_PROVIDED")
                    .drivingLicenseBackPath("NOT_PROVIDED")
                    .vehicleRcBookPath("NOT_PROVIDED")
                    .vehicleInsurancePath("NOT_PROVIDED")
                    .selfiePhotoPath("NOT_PROVIDED")
                    .verificationStatus("APPROVED")
                    .availabilityStatus("OFFLINE")
                    .accountActive(true)
                    .build());
            });

        UserAccount partnerUser = profile.getUserAccount();
        if (partnerUser == null) {
            partnerUser = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Associated user account not found for partner"));
        }

        String orderCode = request.getOrderCode().trim();

        DeliveryTask task = taskRepository.findByPartnerUserIdAndOrderCodeIgnoreCase(partnerUser.getId(), orderCode)
            .orElseGet(() -> DeliveryTask.builder()
                .orderCode(orderCode)
                .partnerUser(profile.getUserAccount())
                .customerName("Customer " + orderCode.substring(Math.max(0, orderCode.length() - 4)))
                .customerPhone("9876543210")
                .pickupLocation(request.getPickupLocation() != null ? request.getPickupLocation() : "Central Warehouse Hub, Farm2Home")
                .deliveryLocation(request.getDeliveryLocation() != null ? request.getDeliveryLocation() : "Customer Address, Farm2Home")
                .paymentMethod("ONLINE")
                .orderAmount(request.getOrderAmount() != null ? BigDecimal.valueOf(request.getOrderAmount()) : BigDecimal.valueOf(450.00))
                .earningsAmount(BigDecimal.valueOf(65.00))
                .status(DeliveryTaskStatus.ASSIGNED)
                .scheduledTime(LocalDateTime.now().plusHours(2))
                .build());

        task.setPartnerUser(partnerUser);
        task.setStatus(DeliveryTaskStatus.ASSIGNED);
        if (request.getPickupLocation() != null) task.setPickupLocation(request.getPickupLocation());
        if (request.getDeliveryLocation() != null) task.setDeliveryLocation(request.getDeliveryLocation());
        if (request.getOrderAmount() != null) task.setOrderAmount(BigDecimal.valueOf(request.getOrderAmount()));

        return taskRepository.save(task);
    }

    private DeliveryPartnerProfile getProfileById(Long id) {
        return profileRepository.findById(id)
            .or(() -> profileRepository.findByUserAccountId(id))
            .orElseThrow(() -> new IllegalArgumentException("Delivery partner not found with ID: " + id));
    }

    private AdminDeliveryPartnerDto mapToDto(DeliveryPartnerProfile profile) {
        AdminDeliveryPartnerDto dto = new AdminDeliveryPartnerDto();
        dto.setId(profile.getId());

        UserAccount user = profile.getUserAccount();
        if (user != null) {
            dto.setUserId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setPhone(user.getPhoneNumber());
        } else {
            dto.setUserId(profile.getUserId());
        }

        dto.setFullName(profile.getFullName());
        dto.setVerificationStatus(profile.getVerificationStatus());
        dto.setAvailabilityStatus(profile.getAvailabilityStatus());
        dto.setAccountActive(profile.isAccountActive());
        dto.setVehicleType(profile.getVehicleType());
        dto.setVehicleNumber(profile.getVehicleNumber());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setEmergencyContactNumber(profile.getEmergencyContactNumber());
        dto.setProfilePhotoPath(profile.getProfilePhotoPath());
        dto.setCreatedAt(profile.getCreatedAt());

        if (user != null) {
            List<DeliveryTask> tasks = taskRepository.findByPartnerUserIdOrderByCreatedAtDesc(user.getId());
            dto.setTotalDeliveries(tasks.size());
            dto.setCompletedDeliveries(tasks.stream().filter(t -> t.getStatus() == DeliveryTaskStatus.DELIVERED).count());
            dto.setActiveDeliveries(tasks.stream().filter(t -> t.getStatus() != DeliveryTaskStatus.DELIVERED && t.getStatus() != DeliveryTaskStatus.CANCELLED).count());
        }

        return dto;
    }
}
