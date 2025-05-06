//package net.javaguides.ims_backend.repository;
//
//import net.javaguides.ims_backend.entity.Subcategory;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import java.util.List;
//
//public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {
//    List<Subcategory> findByCategoryId(Long categoryId);
//
//    @Modifying
//    @Query("DELETE FROM Subcategory s WHERE s.category.id = :categoryId")
//    void deleteByCategoryId(Long categoryId);
//}