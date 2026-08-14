package com.farmtohome.catalog.mapper;

import com.farmtohome.catalog.dto.ProductDTO;
import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.ProductStatus;
import com.farmtohome.catalog.enums.StockStatus;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setSlug(entity.getSlug());
        dto.setProductName(entity.getProductName());
        dto.setCategory(entity.getCategory());
        dto.setSubcategory(entity.getSubcategory());
        dto.setTeluguName(entity.getTeluguName());
        dto.setDescription(entity.getDescription());
        dto.setImageAltText(entity.getImageAltText());
        dto.setFarmerId(entity.getFarmerId());
        dto.setPrice(entity.getPrice());
        dto.setOriginalPrice(entity.getOriginalPrice());
        dto.setMarketPrice(entity.getMarketPrice());
        dto.setRetailPriceMin(entity.getRetailPriceMin());
        dto.setRetailPriceMax(entity.getRetailPriceMax());
        dto.setSellingPrice(entity.getSellingPrice());
        dto.setDiscountPercentage(entity.getDiscountPercentage());
        dto.setQuantity(entity.getQuantity());
        dto.setStockQuantity(entity.getStockQuantity());
        dto.setUnit(entity.getUnit());
        dto.setAvailableUnits(entity.getAvailableUnits());
        dto.setImageUrl(entity.getImageUrl());
        dto.setFarmerName(entity.getFarmerName());
        dto.setFarmerLocation(entity.getFarmerLocation());
        dto.setMinimumOrderQuantity(entity.getMinimumOrderQuantity());
        dto.setMaximumOrderQuantity(entity.getMaximumOrderQuantity());
        dto.setStatus(entity.getStatus());
        dto.setIsFeatured(entity.getIsFeatured());
        dto.setIsOrganic(entity.getIsOrganic());
        dto.setIsPreOrder(entity.getIsPreOrder());
        dto.setExpectedDeliveryDate(entity.getExpectedDeliveryDate());
        dto.setStockStatus(entity.getStockStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setLastPriceUpdatedAt(entity.getLastPriceUpdatedAt());
        dto.setPriceSource(entity.getPriceSource());
        return dto;
    }

    public Product toEntity(ProductDTO dto) {
        Product entity = new Product();
        updateEntityFromDTO(dto, entity);
        return entity;
    }

    public void updateEntityFromDTO(ProductDTO dto, Product entity) {
        entity.setProductName(dto.getProductName());
        entity.setSlug(dto.getSlug());
        entity.setCategory(dto.getCategory());
        entity.setSubcategory(dto.getSubcategory());
        entity.setTeluguName(dto.getTeluguName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setOriginalPrice(dto.getOriginalPrice() != null ? dto.getOriginalPrice() : dto.getPrice());
        entity.setMarketPrice(dto.getMarketPrice() != null ? dto.getMarketPrice() : dto.getOriginalPrice());
        entity.setRetailPriceMin(dto.getRetailPriceMin());
        entity.setRetailPriceMax(dto.getRetailPriceMax());
        entity.setSellingPrice(dto.getSellingPrice() != null ? dto.getSellingPrice() : dto.getPrice());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setQuantity(dto.getQuantity());
        entity.setStockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : dto.getQuantity());
        entity.setUnit(dto.getUnit());
        entity.setAvailableUnits(dto.getAvailableUnits());
        entity.setImageUrl(dto.getImageUrl());
        entity.setImageAltText(dto.getImageAltText());
        entity.setFarmerId(dto.getFarmerId());
        entity.setFarmerName(dto.getFarmerName());
        entity.setFarmerLocation(dto.getFarmerLocation());
        entity.setMinimumOrderQuantity(dto.getMinimumOrderQuantity());
        entity.setMaximumOrderQuantity(dto.getMaximumOrderQuantity());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : ProductStatus.ACTIVE);
        entity.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : Boolean.FALSE);
        entity.setIsOrganic(dto.getIsOrganic() != null ? dto.getIsOrganic() : Boolean.FALSE);
        entity.setIsPreOrder(dto.getIsPreOrder() != null ? dto.getIsPreOrder() : Boolean.FALSE);
        entity.setExpectedDeliveryDate(dto.getExpectedDeliveryDate());
        entity.setLastPriceUpdatedAt(dto.getLastPriceUpdatedAt());
        entity.setPriceSource(dto.getPriceSource());

        if (dto.getStockStatus() != null) {
            entity.setStockStatus(dto.getStockStatus());
        } else {
            Double stock = dto.getStockQuantity() != null ? dto.getStockQuantity() : dto.getQuantity();
            entity.setStockStatus(stock != null && stock > 0D
                ? StockStatus.AVAILABLE
                : StockStatus.OUT_OF_STOCK);
        }
    }
}
