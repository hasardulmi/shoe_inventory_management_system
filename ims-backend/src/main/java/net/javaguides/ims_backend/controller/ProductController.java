// src/main/java/net/javaguides/ims_backend/controller/ProductController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.ErrorResponse;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/by-product-id/{productId}")
    public ResponseEntity<Product> getProductByProductId(@PathVariable String productId) {
        try {
            Product product = productService.getProductByProductId(productId);
            if (product != null) {
                return ResponseEntity.ok(product);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productService.createProduct(product);
            return ResponseEntity.ok(savedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Validation error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to save product: " + e.getMessage()));
        }
    }
}