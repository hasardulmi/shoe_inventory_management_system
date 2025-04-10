// src/main/java/net/javaguides/ims_backend/controller/ProductController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.ErrorResponse;
import net.javaguides.ims_backend.dto.ProductStockUpdate;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productService.createProduct(product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Failed to create product: " + e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updatedProduct = productService.updateProduct(id, product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Failed to update product: " + e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/update-stock/{productId}")
    public ResponseEntity<?> updateStock(@PathVariable String productId, @RequestBody ProductStockUpdate stockUpdate) {
        try {
            Product product = productService.findByProductId(productId);
            if (product == null) {
                return new ResponseEntity<>(new ErrorResponse("Product not found"), HttpStatus.NOT_FOUND);
            }
            product.setInStock(stockUpdate.getInStock());
            Product updatedProduct = productService.updateProduct(product.getId(), product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return new ResponseEntity<>(new ErrorResponse("Failed to update stock: " + e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}