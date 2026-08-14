package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.DeliveryPartnerEmailOtp;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryPartnerEmailOtpRepository extends JpaRepository<DeliveryPartnerEmailOtp, Long> {

    Optional<DeliveryPartnerEmailOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    long countByEmailAndCreatedAtAfter(String email, LocalDateTime createdAt);
}
