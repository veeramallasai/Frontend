package com.farmtohome.catalog.service;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.ProductDTO;
import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.StockStatus;
import com.farmtohome.catalog.exception.FileStorageException;
import com.farmtohome.catalog.exception.ResourceNotFoundException;
import com.farmtohome.catalog.mapper.ProductMapper;
import com.farmtohome.catalog.repository.ProductRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final Path uploadDirectory;

    public ProductServiceImpl(
        ProductRepository productRepository,
        ProductMapper productMapper,
        @Value("${app.upload.product-dir:uploads/products}") String uploadDir
    ) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public ApiResponse<ProductDTO> createProduct(ProductDTO productDTO) {
        Product product = productMapper.toEntity(productDTO);
        if (product.getStockStatus() == null) {
            product.setStockStatus(product.getQuantity() > 0D ? StockStatus.AVAILABLE : StockStatus.OUT_OF_STOCK);
        }
        Product savedProduct = productRepository.save(product);
        return ApiResponse.success("Product created successfully", productMapper.toDTO(savedProduct));
    }

    @Override
    public ApiResponse<Page<ProductDTO>> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productRepository.findAll(pageable).map(productMapper::toDTO);
        return ApiResponse.success("Products fetched successfully", products);
    }

    @Override
    public ApiResponse<ProductDTO> getProductById(Long id) {
        Product product = findProductById(id);
        return ApiResponse.success("Product fetched successfully", productMapper.toDTO(product));
    }

    @Override
    public ApiResponse<ProductDTO> updateProduct(Long id, ProductDTO productDTO) {
        Product existingProduct = findProductById(id);
        productMapper.updateEntityFromDTO(productDTO, existingProduct);
        Product savedProduct = productRepository.save(existingProduct);
        return ApiResponse.success("Product updated successfully", productMapper.toDTO(savedProduct));
    }

    @Override
    public ApiResponse<Void> deleteProduct(Long id) {
        Product existingProduct = findProductById(id);
        productRepository.delete(existingProduct);
        return ApiResponse.success("Product deleted successfully", null);
    }

    @Override
    public ApiResponse<String> uploadProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new FileStorageException("Only image files are allowed");
        }

        try {
            Files.createDirectories(uploadDirectory);
            String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "product-image");
            String extension = extractExtension(originalName);
            String fileName = UUID.randomUUID() + extension;
            Path targetPath = uploadDirectory.resolve(fileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String storedPath = "uploads/products/" + fileName;
            return ApiResponse.success("Image uploaded successfully", storedPath);
        } catch (IOException ex) {
            throw new FileStorageException("Failed to upload image", ex);
        }
    }

    @Override
    public ApiResponse<Page<ProductDTO>> searchByProductName(String productName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> result = productRepository
            .findByProductNameContainingIgnoreCase(productName, pageable)
            .map(productMapper::toDTO);
        return ApiResponse.success("Products fetched successfully", result);
    }

    @Override
    public ApiResponse<Page<ProductDTO>> filterByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        ProductCategory productCategory = ProductCategory.fromValue(category);
        Page<ProductDTO> result = productRepository.findByCategory(productCategory, pageable).map(productMapper::toDTO);
        return ApiResponse.success("Products fetched successfully", result);
    }

    @Override
    public ApiResponse<Page<ProductDTO>> filterByPriceRange(Double minPrice, Double maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> result = productRepository
            .filterProducts(null, null, null, minPrice, maxPrice, null, pageable)
            .map(productMapper::toDTO);
        return ApiResponse.success("Products fetched successfully", result);
    }

    @Override
    public ApiResponse<Page<ProductDTO>> filterByFarmerName(String farmerName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> result = productRepository
            .findByFarmerNameContainingIgnoreCase(farmerName, pageable)
            .map(productMapper::toDTO);
        return ApiResponse.success("Products fetched successfully", result);
    }

    @Override
    public ApiResponse<Page<ProductDTO>> searchProducts(
        String productName,
        String category,
        Double minPrice,
        Double maxPrice,
        String farmerName,
        int page,
        int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        ProductCategory productCategory = category == null || category.isBlank() ? null : ProductCategory.fromValue(category);

        Page<ProductDTO> result = productRepository
            .filterProducts(productName, productName, productCategory, minPrice, maxPrice, farmerName, pageable)
            .map(productMapper::toDTO);

        return ApiResponse.success("Products fetched successfully", result);
    }

    private Product findProductById(Long id) {
        return productRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return ".jpg";
        }
        return fileName.substring(dotIndex);
    }
}
