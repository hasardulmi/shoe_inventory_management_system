// src/main/java/net/javaguides/ims_backend/repository/ProductRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByCategory(String category); // Count products in a category for unique numbering
    Optional<Product> findByProductId(String productId); // Optional, for lookup
}