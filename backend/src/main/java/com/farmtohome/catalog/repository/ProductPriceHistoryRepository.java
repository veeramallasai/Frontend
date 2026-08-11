package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.ProductPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {
}
