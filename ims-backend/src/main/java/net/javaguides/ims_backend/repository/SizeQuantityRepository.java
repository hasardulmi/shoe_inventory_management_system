package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.SizeQuantity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SizeQuantityRepository extends JpaRepository<SizeQuantity, Long> {
    void deleteByProductId(Long productId);
}