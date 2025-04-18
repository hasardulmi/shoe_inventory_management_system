package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product getProductByProductId(String productId) {
        return productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with productId: " + productId));
    }

    public Product createProduct(Product product) {
        // Validate productId uniqueness
        if (product.getProductId() == null || product.getProductId().isEmpty()) {
            throw new IllegalArgumentException("Product ID is required");
        }
        Optional<Product> existingProduct = productRepository.findByProductId(product.getProductId());
        if (existingProduct.isPresent()) {
            throw new IllegalArgumentException("Product ID already exists: " + product.getProductId());
        }

        // Validate required fields
        if (product.getProductName() == null || product.getProductName().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (product.getPurchaseDate() == null) {
            throw new IllegalArgumentException("Purchase date is required");
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valid purchase price is required");
        }
        if (product.getSellingPrice() == null || product.getSellingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valid selling price is required");
        }
        if (product.getCategory() == null || product.getCategory().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (product.getStatus() == null || product.getStatus().isEmpty()) {
            product.setStatus("ACTIVE"); // Default status
        }

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existingProduct = getProductById(id);

        // Validate productId uniqueness (if changed)
        if (!existingProduct.getProductId().equals(product.getProductId())) {
            Optional<Product> productWithId = productRepository.findByProductId(product.getProductId());
            if (productWithId.isPresent()) {
                throw new IllegalArgumentException("Product ID already exists: " + product.getProductId());
            }
        }

        // Update fields
        existingProduct.setProductId(product.getProductId());
        existingProduct.setProductName(product.getProductName());
        existingProduct.setPurchaseDate(product.getPurchaseDate());
        existingProduct.setPurchasePrice(product.getPurchasePrice());
        existingProduct.setSellingPrice(product.getSellingPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setInStock(product.getInStock());
        existingProduct.setCategoryDetails(product.getCategoryDetails());
        existingProduct.setStatus(product.getStatus());
        existingProduct.setSupplierName(product.getSupplierName());
        existingProduct.setBrandName(product.getBrandName());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}