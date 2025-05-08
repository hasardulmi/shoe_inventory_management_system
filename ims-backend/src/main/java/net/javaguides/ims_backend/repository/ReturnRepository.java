package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Return;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {

    @Query("SELECT r FROM Return r LEFT JOIN FETCH r.sizeQuantities")
    List<Return> findAllWithSizeQuantities();
}