package com.farmtohome.catalog.entity;

import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductUnit;
import com.farmtohome.catalog.enums.StockStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCategory category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductUnit unit;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "farmer_name", nullable = false, length = 150)
    private String farmerName;

    @Column(name = "farmer_location", nullable = false, length = 200)
    private String farmerLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 30)
    private StockStatus stockStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        synchronizeStockStatus();
    }

    @PreUpdate
    public void preUpdate() {
        synchronizeStockStatus();
    }

    private void synchronizeStockStatus() {
        if (quantity == null || quantity <= 0D) {
            stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (stockStatus == null) {
            stockStatus = StockStatus.AVAILABLE;
        }
    }
}
