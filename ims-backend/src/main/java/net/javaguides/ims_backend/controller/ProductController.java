// src/main/java/net/javaguides/ims_backend/controller/ProductController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/by-product-id/{productId}")
    public ResponseEntity<Product> getProductByProductId(@PathVariable String productId) {
        Product product = productRepository.findByProductId(productId);
        if (product != null) {
            return ResponseEntity.ok(product);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        try {
            String categoryCode = product.getCategory().substring(0, 3).toUpperCase();
            long count = productRepository.count() + 1;
            String productId = String.format("%03d%s", count, categoryCode);
            product.setProductId(productId);
            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setProductName(productDetails.getProductName());
            product.setPurchaseDate(productDetails.getPurchaseDate());
            product.setPurchasePrice(productDetails.getPurchasePrice());
            product.setSellingPrice(productDetails.getSellingPrice());
            product.setCategory(productDetails.getCategory());
            product.setInStock(productDetails.getInStock());
            product.setCategoryDetails(productDetails.getCategoryDetails());
            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}