package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.DeliveryPartnerFaceProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryPartnerFaceProfileRepository extends JpaRepository<DeliveryPartnerFaceProfile, Long> {

    Optional<DeliveryPartnerFaceProfile> findByUserId(Long userId);
}
