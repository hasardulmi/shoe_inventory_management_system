package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.ReturnRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ReturnService {

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Return> getAllReturns() {
        return returnRepository.findAll();
    }

    public Return createReturn(Return returnEntity) {
        // Validate required fields
        if (returnEntity.getProductId() == null || returnEntity.getProductId().trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID is required");
        }
        if (returnEntity.getReasonForReturn() == null || returnEntity.getReasonForReturn().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason for return is required");
        }
        if (returnEntity.getReturnDate() == null) {
            throw new IllegalArgumentException("Return date is required");
        }

        // Fetch product details
        Optional<Product> productOptional = productRepository.findByProductId(returnEntity.getProductId());
        if (!productOptional.isPresent()) {
            throw new IllegalArgumentException("Product ID does not exist");
        }
        Product product = productOptional.get();

        // Validate product state
        if ("RETURNED".equals(product.getStatus())) {
            throw new IllegalArgumentException("Product is already returned");
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product purchase price must be positive");
        }

        // Auto-fill brandName and purchasePrice
        String brandName = "N/A";
        try {
            JSONObject categoryDetails = new JSONObject(product.getCategoryDetails() != null ? product.getCategoryDetails() : "{}");
            brandName = categoryDetails.optString("brandName", "N/A");
        } catch (Exception e) {
            // Keep default brandName as "N/A"
        }
        returnEntity.setBrandName(brandName);
        returnEntity.setPurchasePrice(product.getPurchasePrice());

        // Set initial status
        if (returnEntity.getStatus() == null) {
            returnEntity.setStatus("Not Returned Yet");
        }

        // Update product status if status is "Returned"
        if ("Returned".equals(returnEntity.getStatus())) {
            product.setStatus("RETURNED");
            productRepository.save(product);
        }

        return returnRepository.save(returnEntity);
    }

    public Optional<Return> updateReturn(Long id, Return returnDetails) {
        Optional<Return> returnOpt = returnRepository.findById(id);
        if (!returnOpt.isPresent()) {
            return Optional.empty();
        }
        Return existingReturn = returnOpt.get();

        // Validate required fields
        if (returnDetails.getReasonForReturn() != null && returnDetails.getReasonForReturn().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason for return cannot be empty");
        }

        // Update fields
        if (returnDetails.getStatus() != null) {
            existingReturn.setStatus(returnDetails.getStatus());
        }
        if (returnDetails.getReturnedToSupplierDate() != null) {
            existingReturn.setReturnedToSupplierDate(returnDetails.getReturnedToSupplierDate());
        }
        if (returnDetails.getSupplierName() != null) {
            existingReturn.setSupplierName(returnDetails.getSupplierName());
        }
        if (returnDetails.getReasonForReturn() != null) {
            existingReturn.setReasonForReturn(returnDetails.getReasonForReturn());
        }
        if (returnDetails.getReturnDate() != null) {
            existingReturn.setReturnDate(returnDetails.getReturnDate());
        }

        // Update product status if status is changed to "Returned"
        if ("Returned".equals(returnDetails.getStatus())) {
            Optional<Product> productOptional = productRepository.findByProductId(existingReturn.getProductId());
            if (productOptional.isPresent()) {
                Product product = productOptional.get();
                product.setStatus("RETURNED");
                productRepository.save(product);
            } else {
                throw new IllegalArgumentException("Product not found");
            }
        }

        return Optional.of(returnRepository.save(existingReturn));
    }
}