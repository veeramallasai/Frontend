package com.farmtohome.catalog.service;

import com.farmtohome.catalog.api.ApiResponse;
import com.farmtohome.catalog.dto.ProductDTO;
import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.ProductCategory;
import com.farmtohome.catalog.enums.ProductStatus;
import com.farmtohome.catalog.enums.StockStatus;
import com.farmtohome.catalog.exception.FileStorageException;
import com.farmtohome.catalog.exception.ResourceNotFoundException;
import com.farmtohome.catalog.mapper.ProductMapper;
import com.farmtohome.catalog.repository.ProductRepository;
import com.farmtohome.catalog.repository.ProductPriceHistoryRepository;
import com.farmtohome.catalog.entity.ProductPriceHistory;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductPriceHistoryRepository productPriceHistoryRepository;
    private final ProductMapper productMapper;
    private final Path uploadDirectory;

    public ProductServiceImpl(
        ProductRepository productRepository,
        ProductPriceHistoryRepository productPriceHistoryRepository,
        ProductMapper productMapper,
        @Value("${app.upload.product-dir:uploads/products}") String uploadDir
    ) {
        this.productRepository = productRepository;
        this.productPriceHistoryRepository = productPriceHistoryRepository;
        this.productMapper = productMapper;
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public ApiResponse<ProductDTO> createProduct(ProductDTO productDTO) {
        Product product = productMapper.toEntity(productDTO);
        applyDerivedValues(product);
        product.setLastPriceUpdatedAt(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        recordPriceHistory(savedProduct, resolvedProfitMargin(savedProduct));
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
        applyDerivedValues(existingProduct);
        Product savedProduct = productRepository.save(existingProduct);
        return ApiResponse.success("Product updated successfully", productMapper.toDTO(savedProduct));
    }

    @Override
    public ApiResponse<ProductDTO> updateProductPrice(Long id, Double marketPrice, Double profitMargin) {
        Product existingProduct = findProductById(id);
        double resolvedMarketPrice = marketPrice != null
            ? marketPrice
            : (existingProduct.getMarketPrice() != null ? existingProduct.getMarketPrice() : existingProduct.getSellingPrice());
        double resolvedMargin = profitMargin != null ? profitMargin : 20D;
        double resolvedSellingPrice = Math.round(resolvedMarketPrice * (1D + resolvedMargin / 100D) * 100D) / 100D;

        existingProduct.setMarketPrice(resolvedMarketPrice);
        existingProduct.setOriginalPrice(resolvedMarketPrice);
        existingProduct.setPrice(resolvedSellingPrice);
        existingProduct.setSellingPrice(resolvedSellingPrice);
        existingProduct.setDiscountPercentage(Math.max(0D, Math.round((1D - (resolvedSellingPrice / resolvedMarketPrice)) * 100D)));
        existingProduct.setLastPriceUpdatedAt(LocalDateTime.now());
        existingProduct.setPriceSource("Hyderabad market starter seed");
        if (existingProduct.getRetailPriceMin() == null) {
            existingProduct.setRetailPriceMin(resolvedMarketPrice);
        }
        applyDerivedValues(existingProduct);
        Product savedProduct = productRepository.save(existingProduct);
        recordPriceHistory(savedProduct, resolvedMargin);
        return ApiResponse.success("Product price updated successfully", productMapper.toDTO(savedProduct));
    }

    @Override
    public ApiResponse<ProductDTO> updateProductStock(Long id, Double stockQuantity) {
        Product existingProduct = findProductById(id);
        existingProduct.setQuantity(stockQuantity);
        existingProduct.setStockQuantity(stockQuantity);
        if (stockQuantity == null || stockQuantity <= 0D) {
            existingProduct.setStockStatus(StockStatus.OUT_OF_STOCK);
            existingProduct.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (existingProduct.getStatus() == ProductStatus.OUT_OF_STOCK) {
            existingProduct.setStatus(ProductStatus.ACTIVE);
            existingProduct.setStockStatus(StockStatus.AVAILABLE);
        }
        applyDerivedValues(existingProduct);
        return ApiResponse.success("Product stock updated successfully", productMapper.toDTO(productRepository.save(existingProduct)));
    }

    @Override
    public ApiResponse<ProductDTO> updateProductStatus(Long id, String status) {
        Product existingProduct = findProductById(id);
        existingProduct.setStatus(ProductStatus.fromValue(status));
        if (existingProduct.getStatus() == ProductStatus.OUT_OF_STOCK) {
            existingProduct.setStockStatus(StockStatus.OUT_OF_STOCK);
        } else if (existingProduct.getStockQuantity() != null && existingProduct.getStockQuantity() > 0D) {
            existingProduct.setStockStatus(StockStatus.AVAILABLE);
        }
        applyDerivedValues(existingProduct);
        return ApiResponse.success("Product status updated successfully", productMapper.toDTO(productRepository.save(existingProduct)));
    }

    @Override
    public ApiResponse<ProductDTO> restoreProduct(Long id) {
        Product existingProduct = findProductById(id);
        existingProduct.setStatus(StockStatus.OUT_OF_STOCK.name().equals(existingProduct.getStockStatus() != null ? existingProduct.getStockStatus().name() : null)
            ? ProductStatus.OUT_OF_STOCK
            : ProductStatus.ACTIVE);
        if (existingProduct.getStockQuantity() != null && existingProduct.getStockQuantity() > 0D) {
            existingProduct.setStockStatus(StockStatus.AVAILABLE);
            if (existingProduct.getStatus() == ProductStatus.OUT_OF_STOCK) {
                existingProduct.setStatus(ProductStatus.ACTIVE);
            }
        }
        applyDerivedValues(existingProduct);
        return ApiResponse.success("Product restored successfully", productMapper.toDTO(productRepository.save(existingProduct)));
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
    public ApiResponse<String> importProducts(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Import file is required");
        }

        String fileName = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase();
        try {
            List<ProductDTO> importedProducts = fileName.endsWith(".xlsx")
                ? importProductsFromExcel(file)
                : importProductsFromCsv(file);

            importedProducts.forEach(this::createProduct);
            return ApiResponse.success("Imported " + importedProducts.size() + " products successfully", "Imported " + importedProducts.size() + " products");
        } catch (IOException ex) {
            throw new FileStorageException("Failed to import products", ex);
        }
    }

    @Override
    public byte[] exportProducts(String format) {
        List<Product> products = productRepository.findAll();
        String normalized = format == null ? "csv" : format.trim().toLowerCase();
        try {
            if ("xlsx".equals(normalized)) {
                return exportProductsToExcel(products);
            }
            return exportProductsToCsv(products).getBytes(StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new FileStorageException("Failed to export products", ex);
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

    private void applyDerivedValues(Product product) {
        if (product.getSellingPrice() == null && product.getPrice() != null) {
            product.setSellingPrice(product.getPrice());
        }
        if (product.getPrice() == null && product.getSellingPrice() != null) {
            product.setPrice(product.getSellingPrice());
        }
        if (product.getOriginalPrice() == null) {
            product.setOriginalPrice(product.getSellingPrice());
        }
        if (product.getMarketPrice() == null) {
            product.setMarketPrice(product.getOriginalPrice());
        }
        if (product.getDiscountPercentage() == null && product.getOriginalPrice() != null && product.getSellingPrice() != null && product.getOriginalPrice() > 0D) {
            product.setDiscountPercentage(Math.max(0D, Math.round((1D - (product.getSellingPrice() / product.getOriginalPrice())) * 100D)));
        }
        if (product.getStockQuantity() == null && product.getQuantity() != null) {
            product.setStockQuantity(product.getQuantity());
        }
        if (product.getQuantity() == null && product.getStockQuantity() != null) {
            product.setQuantity(product.getStockQuantity());
        }
        if (product.getAvailableUnits() == null && product.getUnit() != null) {
            product.setAvailableUnits(product.getUnit().getValue());
        }
        if (product.getSlug() == null || product.getSlug().isBlank()) {
            product.setSlug(buildSlug(product.getProductName(), product.getId()));
        }
        if (product.getStatus() == null) {
            product.setStatus(product.getStockQuantity() != null && product.getStockQuantity() > 0D ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);
        }
        if (product.getStockStatus() == null) {
            product.setStockStatus(product.getStockQuantity() != null && product.getStockQuantity() > 0D ? StockStatus.AVAILABLE : StockStatus.OUT_OF_STOCK);
        }
        if (product.getIsFeatured() == null) {
            product.setIsFeatured(Boolean.FALSE);
        }
        if (product.getIsOrganic() == null) {
            product.setIsOrganic(Boolean.FALSE);
        }
        if (product.getIsPreOrder() == null) {
            product.setIsPreOrder(Boolean.FALSE);
        }
        if (product.getPriceSource() == null || product.getPriceSource().isBlank()) {
            product.setPriceSource("Hyderabad market starter seed");
        }
        if (product.getUpdatedAt() == null) {
            product.setUpdatedAt(LocalDateTime.now());
        }
        if (product.getLastPriceUpdatedAt() == null) {
            product.setLastPriceUpdatedAt(product.getUpdatedAt());
        }
    }

    private String buildSlug(String productName, Long id) {
        String base = (productName == null ? "product" : productName)
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-+|-+$", "");
        return base + "-" + (id == null ? UUID.randomUUID().toString().substring(0, 8) : id);
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return ".jpg";
        }
        return fileName.substring(dotIndex);
    }

    private List<ProductDTO> importProductsFromCsv(MultipartFile file) throws IOException {
        List<ProductDTO> products = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                return products;
            }

            List<String> headers = parseCsvLine(headerLine);
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                List<String> values = parseCsvLine(line);
                products.add(mapRow(headers, values));
            }
        }
        return products;
    }

    private List<ProductDTO> importProductsFromExcel(MultipartFile file) throws IOException {
        List<ProductDTO> products = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return products;
            }

            List<String> headers = new ArrayList<>();
            DataFormatter formatter = new DataFormatter();
            for (Cell cell : headerRow) {
                headers.add(formatter.formatCellValue(cell));
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }
                List<String> values = new ArrayList<>();
                for (int columnIndex = 0; columnIndex < headers.size(); columnIndex++) {
                    Cell cell = row.getCell(columnIndex);
                    values.add(cell == null ? "" : formatter.formatCellValue(cell));
                }
                products.add(mapRow(headers, values));
            }
        }
        return products;
    }

    private ProductDTO mapRow(List<String> headers, List<String> values) {
        Map<String, String> row = new LinkedHashMap<>();
        for (int index = 0; index < headers.size() && index < values.size(); index++) {
            row.put(headers.get(index).trim().toLowerCase(), values.get(index));
        }

        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName(value(row, "productname", "product_name", "name"));
        productDTO.setSlug(value(row, "slug"));
        productDTO.setCategory(ProductCategory.fromValue(value(row, "category")));
        productDTO.setSubcategory(value(row, "subcategory"));
        productDTO.setTeluguName(value(row, "teluguname", "telugu_name"));
        productDTO.setDescription(value(row, "description"));
        productDTO.setImageAltText(value(row, "imagealttext", "image_alt_text"));
        productDTO.setImageUrl(value(row, "imageurl", "image_url"));
        productDTO.setFarmerName(value(row, "farmername", "farmer_name", "farmer"));
        productDTO.setFarmerLocation(value(row, "location", "farmerlocation", "farmer_location"));
        productDTO.setAvailableUnits(value(row, "availableunits", "available_units"));
        productDTO.setUnit(parseUnit(value(row, "unit")));
        productDTO.setMarketPrice(parseDouble(value(row, "marketprice", "market_price")));
        productDTO.setRetailPriceMin(parseDouble(value(row, "retailpricemin", "retail_price_min")));
        productDTO.setRetailPriceMax(parseDouble(value(row, "retailpricemax", "retail_price_max")));
        productDTO.setOriginalPrice(parseDouble(value(row, "originalprice", "original_price")));
        productDTO.setSellingPrice(parseDouble(value(row, "sellingprice", "selling_price", "price")));
        productDTO.setPrice(productDTO.getSellingPrice());
        productDTO.setDiscountPercentage(parseDouble(value(row, "discountpercentage", "discount_percentage")));
        productDTO.setStockQuantity(parseDouble(value(row, "stockquantity", "stock_quantity")));
        productDTO.setQuantity(productDTO.getStockQuantity());
        productDTO.setMinimumOrderQuantity(parseDouble(value(row, "minimumorderquantity", "minimum_order_quantity")));
        productDTO.setMaximumOrderQuantity(parseDouble(value(row, "maximumorderquantity", "maximum_order_quantity")));
        productDTO.setStatus(ProductStatus.fromValue(defaultString(value(row, "status"), "ACTIVE")));
        productDTO.setIsFeatured(parseBoolean(value(row, "isfeatured", "is_featured")));
        productDTO.setIsOrganic(parseBoolean(value(row, "isorganic", "is_organic")));
        productDTO.setIsPreOrder(parseBoolean(value(row, "ispreorder", "is_pre_order")));
        productDTO.setPriceSource(value(row, "pricesource", "price_source"));
        return productDTO;
    }

    private String exportProductsToCsv(List<Product> products) {
        StringBuilder builder = new StringBuilder();
        builder.append("productId,productName,slug,category,subcategory,teluguName,description,imageUrl,imageAltText,farmerId,farmerName,location,unit,availableUnits,marketPrice,originalPrice,sellingPrice,discountPercentage,stockQuantity,minimumOrderQuantity,maximumOrderQuantity,status,isFeatured,isOrganic,isPreOrder,expectedDeliveryDate,lastPriceUpdatedAt,priceSource,createdAt,updatedAt\n");
        for (Product product : products) {
            builder.append(csv(product.getProductId()))
                .append(',').append(csv(product.getProductName()))
                .append(',').append(csv(product.getSlug()))
                .append(',').append(csv(product.getCategory() != null ? product.getCategory().getValue() : null))
                .append(',').append(csv(product.getSubcategory()))
                .append(',').append(csv(product.getTeluguName()))
                .append(',').append(csv(product.getDescription()))
                .append(',').append(csv(product.getImageUrl()))
                .append(',').append(csv(product.getImageAltText()))
                .append(',').append(csv(product.getFarmerId()))
                .append(',').append(csv(product.getFarmerName()))
                .append(',').append(csv(product.getFarmerLocation()))
                .append(',').append(csv(product.getUnit() != null ? product.getUnit().getValue() : null))
                .append(',').append(csv(product.getAvailableUnits()))
                .append(',').append(csv(product.getMarketPrice()))
                .append(',').append(csv(product.getOriginalPrice()))
                .append(',').append(csv(product.getSellingPrice()))
                .append(',').append(csv(product.getDiscountPercentage()))
                .append(',').append(csv(product.getStockQuantity()))
                .append(',').append(csv(product.getMinimumOrderQuantity()))
                .append(',').append(csv(product.getMaximumOrderQuantity()))
                .append(',').append(csv(product.getStatus() != null ? product.getStatus().name() : null))
                .append(',').append(csv(product.getIsFeatured()))
                .append(',').append(csv(product.getIsOrganic()))
                .append(',').append(csv(product.getIsPreOrder()))
                .append(',').append(csv(product.getExpectedDeliveryDate()))
                .append(',').append(csv(product.getLastPriceUpdatedAt()))
                .append(',').append(csv(product.getPriceSource()))
                .append(',').append(csv(product.getCreatedAt()))
                .append(',').append(csv(product.getUpdatedAt()))
                .append('\n');
        }
        return builder.toString();
    }

    private byte[] exportProductsToExcel(List<Product> products) throws IOException {
        try (Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");
            String[] headers = {
                "productId", "productName", "slug", "category", "subcategory", "teluguName", "description", "imageUrl", "imageAltText",
                "farmerId", "farmerName", "location", "unit", "availableUnits", "marketPrice", "originalPrice", "sellingPrice",
                "discountPercentage", "stockQuantity", "minimumOrderQuantity", "maximumOrderQuantity", "status", "isFeatured",
                "isOrganic", "isPreOrder", "expectedDeliveryDate", "lastPriceUpdatedAt", "priceSource", "createdAt", "updatedAt"
            };

            Row headerRow = sheet.createRow(0);
            for (int index = 0; index < headers.length; index++) {
                headerRow.createCell(index).setCellValue(headers[index]);
            }

            int rowIndex = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowIndex++);
                List<String> values = Arrays.asList(
                    stringify(product.getProductId()),
                    product.getProductName(),
                    product.getSlug(),
                    product.getCategory() != null ? product.getCategory().getValue() : null,
                    product.getSubcategory(),
                    product.getTeluguName(),
                    product.getDescription(),
                    product.getImageUrl(),
                    product.getImageAltText(),
                    stringify(product.getFarmerId()),
                    product.getFarmerName(),
                    product.getFarmerLocation(),
                    product.getUnit() != null ? product.getUnit().getValue() : null,
                    product.getAvailableUnits(),
                    stringify(product.getMarketPrice()),
                    stringify(product.getOriginalPrice()),
                    stringify(product.getSellingPrice()),
                    stringify(product.getDiscountPercentage()),
                    stringify(product.getStockQuantity()),
                    stringify(product.getMinimumOrderQuantity()),
                    stringify(product.getMaximumOrderQuantity()),
                    product.getStatus() != null ? product.getStatus().name() : null,
                    stringify(product.getIsFeatured()),
                    stringify(product.getIsOrganic()),
                    stringify(product.getIsPreOrder()),
                    stringify(product.getExpectedDeliveryDate()),
                    stringify(product.getLastPriceUpdatedAt()),
                    product.getPriceSource(),
                    stringify(product.getCreatedAt()),
                    stringify(product.getUpdatedAt())
                );

                for (int column = 0; column < values.size(); column++) {
                    row.createCell(column).setCellValue(values.get(column) == null ? "" : values.get(column));
                }
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int index = 0; index < line.length(); index++) {
            char character = line.charAt(index);
            if (character == '"') {
                if (inQuotes && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (character == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(character);
            }
        }
        values.add(current.toString());
        return values;
    }

    private String csv(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return '"' + text.replace("\"", "\"\"") + '"';
        }
        return text;
    }

    private String stringify(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String value(Map<String, String> row, String... keys) {
        for (String key : keys) {
            String candidate = row.get(key.toLowerCase());
            if (candidate != null && !candidate.isBlank()) {
                return candidate.trim();
            }
        }
        return null;
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.valueOf(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Boolean.valueOf(value.trim());
    }

    private com.farmtohome.catalog.enums.ProductUnit parseUnit(String raw) {
        return raw == null || raw.isBlank() ? null : com.farmtohome.catalog.enums.ProductUnit.fromValue(raw);
    }

    private void recordPriceHistory(Product product, Double profitMargin) {
        ProductPriceHistory history = new ProductPriceHistory();
        history.setProductId(product.getId());
        history.setProductName(product.getProductName());
        history.setMarketPrice(product.getMarketPrice() != null ? product.getMarketPrice() : product.getOriginalPrice());
        history.setSellingPrice(product.getSellingPrice());
        history.setProfitMargin(profitMargin != null ? profitMargin : 20D);
        history.setPriceSource(product.getPriceSource());
        history.setRecordedAt(LocalDateTime.now());
        productPriceHistoryRepository.save(history);
    }

    private Double resolvedProfitMargin(Product product) {
        if (product.getMarketPrice() == null || product.getMarketPrice() <= 0D || product.getSellingPrice() == null) {
            return 20D;
        }
        return Math.max(0D, Math.round(((product.getSellingPrice() / product.getMarketPrice()) - 1D) * 100D));
    }
}
