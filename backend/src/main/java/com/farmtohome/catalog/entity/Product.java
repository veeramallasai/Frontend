package com.farmtohome.catalog.entity;

import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductUnit;
import com.farmtohome.catalog.enums.ProductStatus;
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
import jakarta.persistence.Transient;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductCategory category;

    @Column(name = "subcategory", length = 120)
    private String subcategory;

    @Column(name = "telugu_name", length = 150)
    private String teluguName;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "image_alt_text", length = 200)
    private String imageAltText;

    @Column(name = "farmer_id")
    private Long farmerId;

    @Column(nullable = false)
    private Double originalPrice;

    @Column(name = "market_price")
    private Double marketPrice;

    @Column(name = "retail_price_min")
    private Double retailPriceMin;

    @Column(name = "retail_price_max")
    private Double retailPriceMax;

    @Column(nullable = false)
    private Double sellingPrice;

    @Column(name = "discount_percentage", nullable = false)
    private Double discountPercentage;

    @Column(name = "available_units", length = 60)
    private String availableUnits;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "stock_quantity", nullable = false)
    private Double stockQuantity;

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

    @Column(name = "minimum_order_quantity")
    private Double minimumOrderQuantity;

    @Column(name = "maximum_order_quantity")
    private Double maximumOrderQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductStatus status;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured;

    @Column(name = "is_organic", nullable = false)
    private Boolean isOrganic;

    @Column(name = "is_pre_order", nullable = false)
    private Boolean isPreOrder;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "stock_status", nullable = false, length = 30)
    private StockStatus stockStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_price_updated_at")
    private LocalDateTime lastPriceUpdatedAt;

    @Column(name = "price_source", length = 120)
    private String priceSource;

    @Transient
    private Long productId;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        synchronizeStockStatus();
        synchronizeAliases();
        productId = id;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
        synchronizeStockStatus();
        synchronizeAliases();
        productId = id;
    }

    private void synchronizeStockStatus() {
        if (stockQuantity == null && quantity != null) {
            stockQuantity = quantity;
        }

        if (quantity == null && stockQuantity != null) {
            quantity = stockQuantity;
        }

        if (stockQuantity == null || stockQuantity <= 0D) {
            stockStatus = StockStatus.OUT_OF_STOCK;
        } else if (stockStatus == null) {
            stockStatus = StockStatus.AVAILABLE;
        }
    }

    private void synchronizeAliases() {
        if (sellingPrice == null && price != null) {
            sellingPrice = price;
        }

        if (price == null && sellingPrice != null) {
            price = sellingPrice;
        }

        if (originalPrice == null) {
            originalPrice = sellingPrice;
        }

        if (marketPrice == null) {
            marketPrice = originalPrice;
        }

        if (discountPercentage == null && originalPrice != null && sellingPrice != null && originalPrice > 0D) {
            discountPercentage = Math.max(0D, Math.round((1D - (sellingPrice / originalPrice)) * 100D));
        }

        if (availableUnits == null && unit != null) {
            availableUnits = unit.getValue();
        }

        if (lastPriceUpdatedAt == null) {
            lastPriceUpdatedAt = updatedAt;
        }

        if (priceSource == null || priceSource.isBlank()) {
            priceSource = "Hyderabad market starter seed";
        }

        if (status == null) {
            status = stockStatus == StockStatus.OUT_OF_STOCK ? ProductStatus.OUT_OF_STOCK : ProductStatus.ACTIVE;
        }

        if (isFeatured == null) {
            isFeatured = false;
        }

        if (isOrganic == null) {
            isOrganic = false;
        }

        if (isPreOrder == null) {
            isPreOrder = false;
        }
    }

    public Product() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public ProductCategory getCategory() { return category; }
    public void setCategory(ProductCategory category) { this.category = category; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getTeluguName() { return teluguName; }
    public void setTeluguName(String teluguName) { this.teluguName = teluguName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageAltText() { return imageAltText; }
    public void setImageAltText(String imageAltText) { this.imageAltText = imageAltText; }
    public Long getFarmerId() { return farmerId; }
    public void setFarmerId(Long farmerId) { this.farmerId = farmerId; }
    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }
    public Double getMarketPrice() { return marketPrice; }
    public void setMarketPrice(Double marketPrice) { this.marketPrice = marketPrice; }
    public Double getRetailPriceMin() { return retailPriceMin; }
    public void setRetailPriceMin(Double retailPriceMin) { this.retailPriceMin = retailPriceMin; }
    public Double getRetailPriceMax() { return retailPriceMax; }
    public void setRetailPriceMax(Double retailPriceMax) { this.retailPriceMax = retailPriceMax; }
    public Double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(Double sellingPrice) { this.sellingPrice = sellingPrice; }
    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }
    public String getAvailableUnits() { return availableUnits; }
    public void setAvailableUnits(String availableUnits) { this.availableUnits = availableUnits; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Double stockQuantity) { this.stockQuantity = stockQuantity; }
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }
    public String getFarmerLocation() { return farmerLocation; }
    public void setFarmerLocation(String farmerLocation) { this.farmerLocation = farmerLocation; }
    public Double getMinimumOrderQuantity() { return minimumOrderQuantity; }
    public void setMinimumOrderQuantity(Double minimumOrderQuantity) { this.minimumOrderQuantity = minimumOrderQuantity; }
    public Double getMaximumOrderQuantity() { return maximumOrderQuantity; }
    public void setMaximumOrderQuantity(Double maximumOrderQuantity) { this.maximumOrderQuantity = maximumOrderQuantity; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean featured) { isFeatured = featured; }
    public Boolean getIsOrganic() { return isOrganic; }
    public void setIsOrganic(Boolean organic) { isOrganic = organic; }
    public Boolean getIsPreOrder() { return isPreOrder; }
    public void setIsPreOrder(Boolean preOrder) { isPreOrder = preOrder; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public StockStatus getStockStatus() { return stockStatus; }
    public void setStockStatus(StockStatus stockStatus) { this.stockStatus = stockStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getLastPriceUpdatedAt() { return lastPriceUpdatedAt; }
    public void setLastPriceUpdatedAt(LocalDateTime lastPriceUpdatedAt) { this.lastPriceUpdatedAt = lastPriceUpdatedAt; }
    public String getPriceSource() { return priceSource; }
    public void setPriceSource(String priceSource) { this.priceSource = priceSource; }
    public Long getProductId() { return productId != null ? productId : id; }
    public void setProductId(Long productId) { this.productId = productId; }
}
