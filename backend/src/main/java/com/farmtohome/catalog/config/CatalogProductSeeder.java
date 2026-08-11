package com.farmtohome.catalog.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductStatus;
import com.farmtohome.catalog.enums.ProductUnit;
import com.farmtohome.catalog.enums.StockStatus;
import com.farmtohome.catalog.repository.ProductRepository;
import java.io.InputStream;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class CatalogProductSeeder implements CommandLineRunner {

    private static final int MINIMUM_CATALOG_SIZE = 200;
    private static final String SEED_RESOURCE_PATH = "seeds/products_seed.json";

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    public CatalogProductSeeder(ProductRepository productRepository, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() >= MINIMUM_CATALOG_SIZE) {
            return;
        }

        ClassPathResource resource = new ClassPathResource(SEED_RESOURCE_PATH);
        if (!resource.exists()) {
            return;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            JsonNode rows = objectMapper.readTree(inputStream);
            if (rows == null || !rows.isArray()) {
                return;
            }

            for (JsonNode row : rows) {
                String slug = text(row, "slug");
                if (slug == null || slug.isBlank()) {
                    continue;
                }

                Product product = productRepository.findBySlug(slug).orElseGet(Product::new);
                applySeedRow(product, row);
                productRepository.save(product);
            }
        }
    }

    private void applySeedRow(Product product, JsonNode row) {
        LocalDateTime now = LocalDateTime.now();

        product.setProductName(text(row, "product_name"));
        product.setSlug(text(row, "slug"));
        product.setCategory(ProductCategory.fromValue(text(row, "category")));
        product.setSubcategory(text(row, "subcategory"));
        product.setTeluguName(text(row, "telugu_name"));
        product.setDescription(text(row, "description"));
        product.setImageAltText(text(row, "image_alt_text"));
        product.setFarmerId(longValue(row, "farmer_id"));
        product.setMarketPrice(doubleValue(row, "market_price"));
        product.setRetailPriceMin(doubleValue(row, "retail_price_min"));
        product.setRetailPriceMax(doubleValue(row, "retail_price_max"));
        product.setOriginalPrice(doubleValue(row, "original_price"));
        product.setSellingPrice(doubleValue(row, "selling_price"));
        product.setDiscountPercentage(doubleValue(row, "discount_percentage"));
        product.setAvailableUnits(text(row, "available_units"));
        product.setPrice(doubleValue(row, "price"));
        product.setStockQuantity(doubleValue(row, "stock_quantity"));
        product.setQuantity(doubleValue(row, "quantity"));
        product.setUnit(ProductUnit.fromValue(text(row, "unit")));
        product.setImageUrl(text(row, "image_url"));
        product.setFarmerName(text(row, "farmer_name"));
        product.setFarmerLocation(text(row, "farmer_location"));
        product.setMinimumOrderQuantity(doubleValue(row, "minimum_order_quantity"));
        product.setMaximumOrderQuantity(doubleValue(row, "maximum_order_quantity"));
        product.setStatus(ProductStatus.fromValue(text(row, "status")));
        product.setIsFeatured(booleanValue(row, "is_featured"));
        product.setIsOrganic(booleanValue(row, "is_organic"));
        product.setIsPreOrder(booleanValue(row, "is_pre_order"));
        product.setStockStatus(stockStatus(row));
        product.setLastPriceUpdatedAt(now);
        product.setPriceSource(defaultString(text(row, "price_source"), "Farm2Home full catalog seed"));
        product.setUpdatedAt(now);
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(now);
        }
    }

    private StockStatus stockStatus(JsonNode row) {
        String rawStatus = defaultString(text(row, "stock_status"), "AVAILABLE").trim().toUpperCase();
        return "OUT_OF_STOCK".equals(rawStatus) ? StockStatus.OUT_OF_STOCK : StockStatus.AVAILABLE;
    }

    private String text(JsonNode row, String field) {
        JsonNode value = row.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }

    private Double doubleValue(JsonNode row, String field) {
        JsonNode value = row.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asDouble();
    }

    private Long longValue(JsonNode row, String field) {
        JsonNode value = row.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asLong();
    }

    private Boolean booleanValue(JsonNode row, String field) {
        JsonNode value = row.get(field);
        if (value == null || value.isNull()) {
            return Boolean.FALSE;
        }
        return value.asBoolean();
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
