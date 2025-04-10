// src/main/java/net/javaguides/ims_backend/repository/SaleRepository.java
package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Long> {
}