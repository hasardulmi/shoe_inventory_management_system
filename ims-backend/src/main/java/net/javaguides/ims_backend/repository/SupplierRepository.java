package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}