package com.farmtohome.catalog.repository;

import com.farmtohome.catalog.entity.Product;
import com.farmtohome.catalog.enums.ProductCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByProductNameContainingIgnoreCase(String productName, Pageable pageable);

    Page<Product> findByCategory(ProductCategory category, Pageable pageable);

    Page<Product> findByFarmerNameContainingIgnoreCase(String farmerName, Pageable pageable);

    @Query("""
        SELECT p
        FROM Product p
        WHERE (:productName IS NULL
               OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :productName, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:category IS NULL OR p.category = :category)
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:farmerName IS NULL OR LOWER(p.farmerName) LIKE LOWER(CONCAT('%', :farmerName, '%')))
        """)
    Page<Product> filterProducts(
        @Param("productName") String productName,
        @Param("keyword") String keyword,
        @Param("category") ProductCategory category,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice,
        @Param("farmerName") String farmerName,
        Pageable pageable
    );
}
