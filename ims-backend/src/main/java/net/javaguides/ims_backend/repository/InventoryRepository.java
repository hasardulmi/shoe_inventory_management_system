package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    // Custom query methods can be added here if needed
}