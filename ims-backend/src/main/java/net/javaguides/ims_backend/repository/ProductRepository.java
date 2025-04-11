// src/main/java/net/javaguides/ims_backend/repository/ProductRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByCategory(String category);
}