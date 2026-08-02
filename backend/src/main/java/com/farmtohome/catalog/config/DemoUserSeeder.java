package com.farmtohome.catalog.config;

import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DemoUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<UserAccount> demoUsers = List.of(
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
                .build()
        );

        for (UserAccount demoUser : demoUsers) {
            boolean alreadyPresent = userRepository.existsByEmailIgnoreCase(demoUser.getEmail())
                || userRepository.existsByPhoneNumber(demoUser.getPhoneNumber());

            if (!alreadyPresent) {
                userRepository.save(demoUser);
            }
        }
    }
}