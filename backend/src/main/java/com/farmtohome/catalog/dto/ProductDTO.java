package com.farmtohome.catalog.dto;

import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductUnit;
import com.farmtohome.catalog.enums.ProductStatus;
import com.farmtohome.catalog.enums.StockStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.LocalDate;

public class ProductDTO {

    private Long id;
    private Long productId;

    @Size(max = 180, message = "Slug must not exceed 180 characters")
    private String slug;

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String productName;

    @NotNull(message = "Category is required")
    private ProductCategory category;

    @Size(max = 120, message = "Subcategory must not exceed 120 characters")
    private String subcategory;

    @Size(max = 150, message = "Telugu name must not exceed 150 characters")
    private String teluguName;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 200, message = "Image alt text must not exceed 200 characters")
    private String imageAltText;

    private Long farmerId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private Double price;

    @DecimalMin(value = "0.01", message = "Original price must be greater than 0")
    private Double originalPrice;

    @DecimalMin(value = "0.01", message = "Market price must be greater than 0")
    private Double marketPrice;

    @DecimalMin(value = "0.0", message = "Retail price minimum must be non-negative")
    private Double retailPriceMin;

    @DecimalMin(value = "0.0", message = "Retail price maximum must be non-negative")
    private Double retailPriceMax;

    @DecimalMin(value = "0.0", message = "Selling price must be non-negative")
    private Double sellingPrice;

    @DecimalMin(value = "0.0", message = "Discount percentage must be non-negative")
    private Double discountPercentage;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private Double quantity;

    @DecimalMin(value = "0.0", message = "Stock quantity must be non-negative")
    private Double stockQuantity;

    @NotNull(message = "Unit is required")
    private ProductUnit unit;

    @Size(max = 60, message = "Available units must not exceed 60 characters")
    private String availableUnits;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    @NotBlank(message = "Farmer name is required")
    @Size(max = 150, message = "Farmer name must not exceed 150 characters")
    private String farmerName;

    @NotBlank(message = "Farmer location is required")
    @Size(max = 200, message = "Farmer location must not exceed 200 characters")
    private String farmerLocation;

    @DecimalMin(value = "0.0", message = "Minimum order quantity must be non-negative")
    private Double minimumOrderQuantity;

    @DecimalMin(value = "0.0", message = "Maximum order quantity must be non-negative")
    private Double maximumOrderQuantity;

    private ProductStatus status;

    private Boolean isFeatured;

    private Boolean isOrganic;

    private Boolean isPreOrder;

    private LocalDate expectedDeliveryDate;

    private StockStatus stockStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime lastPriceUpdatedAt;

    @Size(max = 120, message = "Price source must not exceed 120 characters")
    private String priceSource;

    public ProductDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId != null ? productId : id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
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
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
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
    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }
    public Double getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Double stockQuantity) { this.stockQuantity = stockQuantity; }
    public ProductUnit getUnit() { return unit; }
    public void setUnit(ProductUnit unit) { this.unit = unit; }
    public String getAvailableUnits() { return availableUnits; }
    public void setAvailableUnits(String availableUnits) { this.availableUnits = availableUnits; }
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
}
