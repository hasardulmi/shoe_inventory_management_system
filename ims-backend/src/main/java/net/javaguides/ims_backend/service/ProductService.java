// src/main/java/net/javaguides/ims_backend/service/ProductService.java
package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductByProductId(String productId) {
        return productRepository.findByProductId(productId);
    }

    public Product createProduct(Product product) {
        // Validate required fields
        if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product Name is required");
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException("Valid Purchase Price is required");
        }
        if (product.getSellingPrice() == null || product.getSellingPrice() <= 0) {
            throw new IllegalArgumentException("Valid Selling Price is required");
        }
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (product.getPurchaseDate() == null || product.getPurchaseDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Purchase Date is required");
        }
        // Set defaults
        if (product.getInStock() == null) {
            product.setInStock(true);
        }
        // Validate categoryDetails
        if (product.getCategoryDetails() != null && !product.getCategoryDetails().trim().isEmpty()) {
            try {
                new org.json.JSONObject(product.getCategoryDetails());
            } catch (Exception e) {
                throw new IllegalArgumentException("Category Details must be valid JSON");
            }
        }
        // Generate unique productId
        String categoryAbbr;
        switch (product.getCategory().toLowerCase()) {
            case "shoes":
                categoryAbbr = "SHO";
                break;
            case "water bottle":
                categoryAbbr = "BOT";
                break;
            case "bags":
                categoryAbbr = "BAG";
                break;
            case "slippers":
                categoryAbbr = "SLP";
                break;
            case "shoe polish":
                categoryAbbr = "POL";
                break;
            case "socks":
                categoryAbbr = "SOC";
                break;
            case "other accessories":
                categoryAbbr = "ACC";
                break;
            default:
                throw new IllegalArgumentException("Invalid category");
        }
        // Find next available number
        int number = 1;
        String productId;
        do {
            productId = String.format("%03d%s", number, categoryAbbr);
            number++;
        } while (productRepository.findByProductId(productId) != null);
        product.setProductId(productId);

        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product product) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (!existingProduct.isPresent()) {
            return Optional.empty();
        }
        Product updatedProduct = existingProduct.get();

        // Validate required fields
        if (product.getProductName() == null || product.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product Name is required");
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException("Valid Purchase Price is required");
        }
        if (product.getSellingPrice() == null || product.getSellingPrice() <= 0) {
            throw new IllegalArgumentException("Valid Selling Price is required");
        }
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (product.getPurchaseDate() == null || product.getPurchaseDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Purchase Date is required");
        }
        // Validate categoryDetails
        if (product.getCategoryDetails() != null && !product.getCategoryDetails().trim().isEmpty()) {
            try {
                new org.json.JSONObject(product.getCategoryDetails());
            } catch (Exception e) {
                throw new IllegalArgumentException("Category Details must be valid JSON");
            }
        }

        // Update fields
        updatedProduct.setProductName(product.getProductName());
        updatedProduct.setPurchaseDate(product.getPurchaseDate());
        updatedProduct.setPurchasePrice(product.getPurchasePrice());
        updatedProduct.setSellingPrice(product.getSellingPrice());
        updatedProduct.setCategory(product.getCategory());
        updatedProduct.setInStock(product.getInStock() != null ? product.getInStock() : true);
        updatedProduct.setCategoryDetails(product.getCategoryDetails());

        // ProductId remains unchanged
        if (product.getProductId() != null && !product.getProductId().equals(updatedProduct.getProductId())) {
            throw new IllegalArgumentException("Product ID cannot be changed");
        }

        return Optional.of(productRepository.save(updatedProduct));
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}