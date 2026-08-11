package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.DeliveryPartnerProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, Long> {

	Optional<DeliveryPartnerProfile> findByUserAccountId(Long userId);
}
