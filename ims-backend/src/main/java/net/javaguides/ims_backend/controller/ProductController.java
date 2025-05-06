package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.ProductDTO;
import net.javaguides.ims_backend.dto.SizeQuantityDTO;
import net.javaguides.ims_backend.entity.Category;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.service.InventoryService;
import net.javaguides.ims_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(inventoryService.getAllProducts());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("purchasePrice") Double purchasePrice,
            @RequestParam("sellingPrice") Double sellingPrice,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam("purchaseDate") String purchaseDate,
            @RequestParam("hasSizes") Boolean hasSizes,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "sizes", required = false) String[] sizes,
            @RequestParam(value = "quantities", required = false) Integer[] quantities,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam Map<String, String> allParams // Capture all parameters to extract subcategories
    ) {
        try {
            ProductDTO productDTO = buildProductDTO(productName, categoryId, purchasePrice, sellingPrice, brandName,
                    purchaseDate, hasSizes, quantity, sizes, quantities, image, allParams);

            // Save the product first without the image
            ProductDTO savedProductDTO = inventoryService.addProduct(productDTO);

            // If an image is provided, update the product with the image
            if (image != null && !image.isEmpty()) {
                Product product = productRepository.findById(savedProductDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Product not found after saving"));
                product.setImage(image.getBytes());
                productRepository.save(product);
                savedProductDTO.setImage(Base64.getEncoder().encodeToString(product.getImage()));
            }

            return ResponseEntity.ok(savedProductDTO);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("productName") String productName,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("purchasePrice") Double purchasePrice,
            @RequestParam("sellingPrice") Double sellingPrice,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam("purchaseDate") String purchaseDate,
            @RequestParam("hasSizes") Boolean hasSizes,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "sizes", required = false) String[] sizes,
            @RequestParam(value = "quantities", required = false) Integer[] quantities,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam Map<String, String> allParams // Capture all parameters to extract subcategories
    ) {
        try {
            ProductDTO productDTO = buildProductDTO(productName, categoryId, purchasePrice, sellingPrice, brandName,
                    purchaseDate, hasSizes, quantity, sizes, quantities, image, allParams);

            // Update the product without the image first
            ProductDTO updatedProductDTO = inventoryService.updateProduct(id, productDTO);

            // If an image is provided, update the product with the new image
            if (image != null && !image.isEmpty()) {
                Product product = productRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found after updating"));
                product.setImage(image.getBytes());
                productRepository.save(product);
                updatedProductDTO.setImage(Base64.getEncoder().encodeToString(product.getImage()));
            }

            return ResponseEntity.ok(updatedProductDTO);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            inventoryService.deleteProduct(id);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Product deleted successfully");
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    private ProductDTO buildProductDTO(
            String productName, Long categoryId, Double purchasePrice, Double sellingPrice, String brandName,
            String purchaseDate, Boolean hasSizes, Integer quantity, String[] sizes, Integer[] quantities,
            MultipartFile image, Map<String, String> allParams
    ) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName(productName);
        productDTO.setCategoryId(categoryId);
        productDTO.setPurchasePrice(purchasePrice);
        productDTO.setSellingPrice(sellingPrice);
        productDTO.setBrandName(brandName);
        productDTO.setPurchaseDate(purchaseDate);
        productDTO.setHasSizes(hasSizes);

        // Fetch the category to get allowed subcategories
        Category category = inventoryService.getAllCategories().stream()
                .filter(c -> c.getId().equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Extract subcategory values from allParams
        Map<String, String> subcategories = new HashMap<>();
        List<String> allowedSubcategories = category.getAllowedSubcategories() != null ? category.getAllowedSubcategories() : new ArrayList<>();
        for (String subcat : allowedSubcategories) {
            // Convert subcategory name to lowercase to match request parameter keys
            String paramKey = subcat.toLowerCase();
            String value = allParams.get(paramKey);
            subcategories.put(subcat, value != null ? value : "");
        }
        productDTO.setSubcategories(subcategories);

        // Handle sizes and quantities
        if (hasSizes && sizes != null && quantities != null && sizes.length == quantities.length) {
            List<SizeQuantityDTO> sizeQuantities = new ArrayList<>();
            for (int i = 0; i < sizes.length; i++) {
                if (sizes[i] != null && quantities[i] != null) {
                    sizeQuantities.add(new SizeQuantityDTO(sizes[i], quantities[i]));
                }
            }
            productDTO.setSizeQuantities(sizeQuantities);
        } else {
            productDTO.setQuantity(quantity != null ? quantity : 0);
        }

        return productDTO;
    }
}