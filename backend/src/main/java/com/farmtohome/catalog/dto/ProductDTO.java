package com.farmtohome.catalog.dto;

import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductUnit;
import com.farmtohome.catalog.enums.StockStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String productName;

    @NotNull(message = "Category is required")
    private ProductCategory category;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private Double price;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private Double quantity;

    @NotNull(message = "Unit is required")
    private ProductUnit unit;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    @NotBlank(message = "Farmer name is required")
    @Size(max = 150, message = "Farmer name must not exceed 150 characters")
    private String farmerName;

    @NotBlank(message = "Farmer location is required")
    @Size(max = 200, message = "Farmer location must not exceed 200 characters")
    private String farmerLocation;

    private StockStatus stockStatus;

    private LocalDateTime createdAt;
}
