// src/main/java/net/javaguides/ims_backend/repository/SupplierRepository.java
package net.javaguides.ims_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import net.javaguides.ims_backend.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}