package com.farmtohome.catalog.config;

import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DemoUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<UserAccount> demoUsers = List.of(
            UserAccount.builder()
                .firstName("Super")
                .lastName("Admin")
                .email("veeramallasaipichaiah456@gmail.com")
                .phoneNumber("9876543200")
                .password(passwordEncoder.encode("password123"))
                .role(UserRole.ADMIN)
                .build(),
            UserAccount.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@farmtohome.com")
                .phoneNumber("9876543210")
                .password(passwordEncoder.encode("password123"))
                .role(UserRole.ADMIN)
                .build(),
            UserAccount.builder()
                .firstName("Farmer")
                .lastName("User")
                .email("farmer@farmtohome.com")
                .phoneNumber("9876543211")
                .password(passwordEncoder.encode("password123"))
                .role(UserRole.FARMER)
                .build(),
            UserAccount.builder()
                .firstName("Customer")
                .lastName("User")
                .email("customer@farmtohome.com")
                .phoneNumber("9876543212")
                .password(passwordEncoder.encode("password123"))
                .role(UserRole.CUSTOMER)
                .build(),
            UserAccount.builder()
                .firstName("Delivery")
                .lastName("Partner")
                .email("delivery@farmtohome.com")
                .phoneNumber("9876543213")
                .password(passwordEncoder.encode("password123"))
                .role(UserRole.DELIVERY_PARTNER)
                .build()
        );

        for (UserAccount demoUser : demoUsers) {
            UserAccount savedUser = userRepository.findByEmailIgnoreCase(demoUser.getEmail())
                .orElseGet(() -> {
                    if (!userRepository.existsByPhoneNumber(demoUser.getPhoneNumber())) {
                        return userRepository.save(demoUser);
                    }
                    return null;
                });

            if (savedUser != null && savedUser.getRole() == UserRole.DELIVERY_PARTNER) {
                if (deliveryPartnerProfileRepository.findByUserAccountId(savedUser.getId()).isEmpty()) {
                    DeliveryPartnerProfile profile = DeliveryPartnerProfile.builder()
                        .userAccount(savedUser)
                        .fullName(savedUser.getFirstName() + " " + savedUser.getLastName())
                        .dateOfBirth(LocalDate.of(1995, 5, 20))
                        .gender("MALE")
                        .aadhaarNumber("987654321099")
                        .drivingLicenseNumber("DL-REF-102030")
                        .vehicleType("MOTORBIKE")
                        .vehicleNumber("MH15XY9999")
                        .address("Central Depot, Nashik Hub")
                        .city("Nashik")
                        .state("Maharashtra")
                        .pincode("422003")
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
                        .availabilityStatus("ONLINE")
                        .accountActive(true)
                        .build();

                    deliveryPartnerProfileRepository.save(profile);
                }
            }
        }
    }
}