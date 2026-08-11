package com.farmtohome.catalog.controller;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.ProductDTO;
import com.farmtohome.catalog.service.ProductService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy_MM_dd_HHmmss");

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAdminProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.getAllProducts(page, size));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createAdminProduct(@Valid @RequestBody ProductDTO productDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(productDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateAdminProduct(
        @PathVariable Long id,
        @Valid @RequestBody ProductDTO productDTO
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, productDTO));
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<ApiResponse<ProductDTO>> updateAdminProductPrice(
        @PathVariable Long id,
        @RequestBody PricePayload payload
    ) {
        return ResponseEntity.ok(productService.updateProductPrice(id, payload.marketPrice(), payload.profitMargin()));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductDTO>> updateAdminProductStock(
        @PathVariable Long id,
        @RequestBody StockPayload payload
    ) {
        return ResponseEntity.ok(productService.updateProductStock(id, payload.stockQuantity()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductDTO>> updateAdminProductStatus(
        @PathVariable Long id,
        @RequestBody StatusPayload payload
    ) {
        return ResponseEntity.ok(productService.updateProductStatus(id, payload.status()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<ProductDTO>> restoreAdminProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.restoreProduct(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdminProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<String>> importAdminProducts(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(productService.importProducts(file));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportAdminProducts(@RequestParam(defaultValue = "csv") String format) {
        byte[] payload = productService.exportProducts(format);
        String normalizedFormat = format == null ? "csv" : format.trim().toLowerCase();
        String contentType = "xlsx".equals(normalizedFormat)
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv";
        String extension = "xlsx".equals(normalizedFormat) ? "xlsx" : "csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDisposition(ContentDisposition.attachment().filename(buildFileName(extension)).build());

        return ResponseEntity.ok().headers(headers).body(payload);
    }

    public record PricePayload(Double marketPrice, Double profitMargin) {}
    public record StockPayload(Double stockQuantity) {}
    public record StatusPayload(String status) {}

    private String buildFileName(String extension) {
        return "hyderabad_product_catalog_" + LocalDate.now().format(FILE_DATE_FORMAT) + "." + extension;
    }
}