// src/main/java/net/javaguides/ims_backend/service/ProductService.java
package net.javaguides.ims_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.repository.ProductRepository;

import java.util.List;
import java.util.Random;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        String categoryAbbr = getCategoryAbbreviation(product.getCategory());
        String uniqueNumber;
        String productId;
        do {
            uniqueNumber = String.format("%03d", new Random().nextInt(1000));
            productId = uniqueNumber + categoryAbbr;
        } while (productRepository.findByProductId(productId) != null);
        product.setProductId(productId);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existing = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setProductName(product.getProductName());
        existing.setPurchaseDate(product.getPurchaseDate());
        existing.setPurchasePrice(product.getPurchasePrice());
        existing.setSupplierName(product.getSupplierName());
        existing.setCategory(product.getCategory());
        existing.setInStock(product.getInStock());
        existing.setCategoryDetails(product.getCategoryDetails());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product findByProductId(String productId) {
        return productRepository.findByProductId(productId);
    }

    private String getCategoryAbbreviation(String category) {
        switch (category.toLowerCase()) {
            case "shoes": return "SHO";
            case "water bottle": return "WBT";
            case "bags": return "BAG";
            case "slippers": return "SLP";
            case "shoe polish": return "SHP";
            case "socks": return "SOC";
            case "other accessories": return "ACC";
            default: return "UNK";
        }
    }
}