package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        existingProduct.setProductName(product.getProductName());
        existingProduct.setSupplierName(product.getSupplierName());
        existingProduct.setBrandName(product.getBrandName());
        existingProduct.setPurchaseDate(product.getPurchaseDate());
        existingProduct.setPurchasePrice(product.getPurchasePrice());
        existingProduct.setSellingPrice(product.getSellingPrice());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setInStock(product.getInStock());
        existingProduct.setCategoryDetails(product.getCategoryDetails());
        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Product findByProductId(String productId) {
        return productRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
    }

    public Product markProductAsReturned(String productId) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));
        if (!product.getStatus().equals("RETURNED")) {
            product.setStatus("RETURNED");
            return productRepository.save(product);
        }
        return product;
    }
}