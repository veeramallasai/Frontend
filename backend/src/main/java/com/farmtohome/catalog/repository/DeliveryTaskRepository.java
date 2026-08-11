package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.DeliveryTask;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryTaskRepository extends JpaRepository<DeliveryTask, Long> {

    List<DeliveryTask> findByPartnerUserIdOrderByCreatedAtDesc(Long partnerUserId);

    Optional<DeliveryTask> findByPartnerUserIdAndOrderCodeIgnoreCase(Long partnerUserId, String orderCode);
}
