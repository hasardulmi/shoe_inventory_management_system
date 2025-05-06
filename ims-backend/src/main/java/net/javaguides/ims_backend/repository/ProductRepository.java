package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.sizeQuantities sq LEFT JOIN FETCH p.subcategories WHERE p.id = p.id")
    List<Product> findAllWithSubcategoriesAndSizes();

    List<Product> findByCategoryId(Long categoryId);

    @Query("SELECT MAX(p.productId) FROM Product p WHERE p.productId LIKE ?1%")
    String findMaxProductIdByCategoryPrefix(String prefix);
}