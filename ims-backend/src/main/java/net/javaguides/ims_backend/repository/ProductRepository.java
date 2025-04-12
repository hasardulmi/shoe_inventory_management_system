// src/main/java/net/javaguides/ims_backend/repository/ProductRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Product findByProductId(String productId); // Existing method (e.g., for SalesManagement)
    long countByCategory(String category); // Added method to count products by category
}