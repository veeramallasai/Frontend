package com.farmtohome.catalog.mapper;

import com.farmtohome.catalog.dto.ProductDTO;
import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.StockStatus;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product entity) {
        return ProductDTO.builder()
            .id(entity.getId())
            .productName(entity.getProductName())
            .category(entity.getCategory())
            .description(entity.getDescription())
            .price(entity.getPrice())
            .quantity(entity.getQuantity())
            .unit(entity.getUnit())
            .imageUrl(entity.getImageUrl())
            .farmerName(entity.getFarmerName())
            .farmerLocation(entity.getFarmerLocation())
            .stockStatus(entity.getStockStatus())
            .createdAt(entity.getCreatedAt())
            .build();
    }

    public Product toEntity(ProductDTO dto) {
        Product entity = Product.builder().build();
        updateEntityFromDTO(dto, entity);
        return entity;
    }

    public void updateEntityFromDTO(ProductDTO dto, Product entity) {
        entity.setProductName(dto.getProductName());
        entity.setCategory(dto.getCategory());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setQuantity(dto.getQuantity());
        entity.setUnit(dto.getUnit());
        entity.setImageUrl(dto.getImageUrl());
        entity.setFarmerName(dto.getFarmerName());
        entity.setFarmerLocation(dto.getFarmerLocation());

        if (dto.getStockStatus() != null) {
            entity.setStockStatus(dto.getStockStatus());
        } else {
            entity.setStockStatus(dto.getQuantity() != null && dto.getQuantity() > 0D
                ? StockStatus.AVAILABLE
                : StockStatus.OUT_OF_STOCK);
        }
    }
}
