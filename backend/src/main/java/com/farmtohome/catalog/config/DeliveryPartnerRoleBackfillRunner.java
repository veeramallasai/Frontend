package com.farmtohome.catalog.config;

import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.DeliveryPartnerProfileRepository;
import com.farmtohome.catalog.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeliveryPartnerRoleBackfillRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DeliveryPartnerRoleBackfillRunner.class);

    private final DeliveryPartnerProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<DeliveryPartnerProfile> profiles = profileRepository.findAll();
        int correctedCount = 0;

        for (DeliveryPartnerProfile profile : profiles) {
            UserAccount user = profile.getUserAccount();
            if (user == null || user.getRole() == UserRole.DELIVERY_PARTNER) {
                continue;
            }

            UserRole previousRole = user.getRole();
            user.setRole(UserRole.DELIVERY_PARTNER);
            userRepository.save(user);
            correctedCount++;

            log.warn(
                "[ROLE_BACKFILL] Corrected role for userId={} from {} to {}",
                user.getId(),
                previousRole,
                UserRole.DELIVERY_PARTNER
            );
        }

        if (correctedCount > 0) {
            log.warn("[ROLE_BACKFILL] Completed with {} corrected delivery partner role assignments.", correctedCount);
        } else {
            log.info("[ROLE_BACKFILL] No delivery partner role corrections were required.");
        }
    }
}
