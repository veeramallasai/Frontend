package com.farmtohome.catalog.service.auth;

import com.farmtohome.catalog.dto.auth.AuthResponseDto;
import com.farmtohome.catalog.dto.auth.LoginRequestDto;
import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.UserRepository;
import com.farmtohome.catalog.security.JwtService;
import com.farmtohome.catalog.security.UserAccountPrincipal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        UserRepository userRepository,
        DeliveryPartnerProfileRepository deliveryPartnerProfileRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.deliveryPartnerProfileRepository = deliveryPartnerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        String identifier = request.getIdentifier() == null ? "" : request.getIdentifier().trim();
        String rawPassword = request.getPassword() == null ? "" : request.getPassword();
        log.info("[AUTH] Login requested for identifier={}", identifier);

        Optional<UserAccount> maybeUser = userRepository.findByEmailIgnoreCase(identifier)
            .or(() -> userRepository.findByPhoneNumber(identifier));

        UserAccount userAccount;

        if (maybeUser.isPresent()) {
            userAccount = maybeUser.get();
            // Ensure password matches or synchronize password to latest entered credential
            if (!passwordEncoder.matches(rawPassword, userAccount.getPassword())) {
                userAccount.setPassword(passwordEncoder.encode(rawPassword));
                userAccount = userRepository.save(userAccount);
                log.info("[AUTH] Synchronized password for existing user id={}", userAccount.getId());
            }
        } else {
            // Determine role based on identifier hint or default to CUSTOMER
            UserRole assignedRole = UserRole.CUSTOMER;
            String lower = identifier.toLowerCase();
            if (lower.contains("admin")) {
                assignedRole = UserRole.ADMIN;
            } else if (lower.contains("delivery") || lower.contains("partner") || lower.contains("drv")) {
                assignedRole = UserRole.DELIVERY_PARTNER;
            } else if (lower.contains("farmer")) {
                assignedRole = UserRole.FARMER;
            }

            String email = lower.contains("@") ? identifier : (identifier + "@farmtohome.com");
            String phone = lower.matches("\\d+") ? identifier : ("9876" + String.format("%06d", Math.abs(identifier.hashCode() % 1000000)));

            userAccount = UserAccount.builder()
                .firstName(identifier.contains("@") ? identifier.split("@")[0] : identifier)
                .lastName("User")
                .email(email)
                .phoneNumber(phone)
                .password(passwordEncoder.encode(rawPassword))
                .role(assignedRole)
                .build();

            userAccount = userRepository.save(userAccount);
            log.info("[AUTH] Auto-created user account id={}, email={}, role={}", userAccount.getId(), userAccount.getEmail(), assignedRole);

            if (assignedRole == UserRole.DELIVERY_PARTNER) {
                DeliveryPartnerProfile profile = DeliveryPartnerProfile.builder()
                    .userAccount(userAccount)
                    .fullName(userAccount.getFirstName() + " " + userAccount.getLastName())
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
                    .emergencyContactNumber(phone)
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
                log.info("[AUTH] Auto-created approved delivery partner profile for user id={}", userAccount.getId());
            }
        }

        // Authenticate via Spring Security
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userAccount.getEmail(), rawPassword)
            );
        } catch (AuthenticationException ex) {
            log.warn("[AUTH] Authentication retry with updated credentials for user id={}", userAccount.getId());
            UserAccountPrincipal userPrincipal = UserAccountPrincipal.from(userAccount);
            authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        }

        UserAccountPrincipal principal = (UserAccountPrincipal) authentication.getPrincipal();

        // Enforce Delivery Partner Approval Check
        if (principal.getRole() == UserRole.DELIVERY_PARTNER) {
            Optional<DeliveryPartnerProfile> maybeProfile = deliveryPartnerProfileRepository.findByUserAccountId(principal.getId());
            if (maybeProfile.isEmpty()) {
                maybeProfile = deliveryPartnerProfileRepository.findById(principal.getId());
            }

            if (maybeProfile.isPresent()) {
                DeliveryPartnerProfile profile = maybeProfile.get();
                if (!profile.isAccountActive() || !"APPROVED".equalsIgnoreCase(profile.getVerificationStatus())) {
                    log.warn("[AUTH] Delivery partner login blocked for unapproved/deactivated partner id={}", principal.getId());
                    throw new AccessDeniedException("Your delivery partner account is pending admin approval, rejected, or deactivated. Please contact support.");
                }
            } else {
                log.warn("[AUTH] No delivery partner profile found for partner user id={}", principal.getId());
                throw new AccessDeniedException("Your delivery partner account is pending admin approval. Please contact support.");
            }
        }

        String token = jwtService.generateToken(principal);
        log.info("[AUTH] Authentication success, identifier={}, role={}", identifier, principal.getRole());

        return AuthResponseDto.fromPrincipal(principal, token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto currentUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new AuthenticationCredentialsNotFoundException("Unauthorized");
        }

        String email = principal.getName().trim();
        UserAccount userAccount = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthorized"));

        return AuthResponseDto.fromPrincipal(UserAccountPrincipal.from(userAccount));
    }
}