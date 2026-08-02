package com.farmtohome.catalog.service;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ApiResponse<ProductDTO> createProduct(ProductDTO productDTO);

    ApiResponse<Page<ProductDTO>> getAllProducts(int page, int size);

    ApiResponse<ProductDTO> getProductById(Long id);

    ApiResponse<ProductDTO> updateProduct(Long id, ProductDTO productDTO);

    ApiResponse<Void> deleteProduct(Long id);

    ApiResponse<String> uploadProductImage(MultipartFile file);

    ApiResponse<Page<ProductDTO>> searchByProductName(String productName, int page, int size);

    ApiResponse<Page<ProductDTO>> filterByCategory(String category, int page, int size);

    ApiResponse<Page<ProductDTO>> filterByPriceRange(Double minPrice, Double maxPrice, int page, int size);

    ApiResponse<Page<ProductDTO>> filterByFarmerName(String farmerName, int page, int size);

    ApiResponse<Page<ProductDTO>> searchProducts(
        String productName,
        String category,
        Double minPrice,
        Double maxPrice,
        String farmerName,
        int page,
        int size
    );
}
