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

    public Product createProduct(Product product) {
        // Generate productId: 3-digit number + 3-char category abbreviation
        String categoryAbbr = getCategoryAbbreviation(product.getCategory());
        long categoryCount = productRepository.countByCategory(product.getCategory()) + 1;
        String uniqueNum = String.format("%03d", Math.min(categoryCount, 999)); // Cap at 999
        product.setProductId(uniqueNum + categoryAbbr);
        return productRepository.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setProductName(productDetails.getProductName());
            product.setPurchaseDate(productDetails.getPurchaseDate());
            product.setPurchasePrice(productDetails.getPurchasePrice());
            product.setCategory(productDetails.getCategory());
            product.setInStock(productDetails.getInStock());
            product.setCategoryDetails(productDetails.getCategoryDetails());
            // productId is not updated (immutable)
            return Optional.of(productRepository.save(product));
        }
        return Optional.empty();
    }

    public boolean deleteProduct(Long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private String getCategoryAbbreviation(String category) {
        switch (category.toLowerCase()) {
            case "shoes": return "SHO";
            case "water bottle": return "WAT";
            case "bags": return "BAG";
            case "slippers": return "SLI";
            case "shoe polish": return "POL";
            case "socks": return "SOC";
            case "other accessories": return "ACC";
            default: return "UNK"; // Unknown category fallback
        }
    }
}