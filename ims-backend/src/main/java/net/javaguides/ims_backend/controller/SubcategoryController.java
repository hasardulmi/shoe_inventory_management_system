//package net.javaguides.ims_backend.controller;
//
//import net.javaguides.ims_backend.dto.SubcategoryDTO;
//import net.javaguides.ims_backend.entity.Category;
//import net.javaguides.ims_backend.entity.Subcategory;
//import net.javaguides.ims_backend.service.InventoryService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import jakarta.validation.Valid;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/subcategories")
//public class SubcategoryController {
//
//    @Autowired
//    private InventoryService inventoryService;
//
//    @GetMapping("/{categoryId}")
//    public List<Subcategory> getSubcategoriesByCategory(@PathVariable Long categoryId) {
//        return inventoryService.getSubcategoriesByCategory(categoryId);
//    }
//
//    @PostMapping
//    public ResponseEntity<?> createSubcategory(@Valid @RequestBody SubcategoryDTO subcategoryDTO) {
//        try {
//            Subcategory savedSubcategory = inventoryService.addSubcategory(subcategoryDTO);
//            return ResponseEntity.ok(savedSubcategory);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
//        }
//    }
//
//    @GetMapping("/values/{categoryName}")
//    public Map<String, String> getSubcategoryValues(@PathVariable String categoryName) {
//        return inventoryService.getSubcategoryValues(categoryName);
//    }
//}