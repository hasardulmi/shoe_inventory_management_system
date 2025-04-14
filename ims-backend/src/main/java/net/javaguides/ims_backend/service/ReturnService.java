// src/main/java/net/javaguides/ims_backend/service/ReturnService.java
package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.ReturnRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        if (returnEntity.getBrandName() == null || returnEntity.getBrandName().trim().isEmpty()) {
            throw new IllegalArgumentException("Brand Name is required");
        }
        if (returnEntity.getSupplierName() == null || returnEntity.getSupplierName().trim().isEmpty()) {
            throw new IllegalArgumentException("Supplier Name is required");
        }
        if (returnEntity.getPurchasePrice() == null || returnEntity.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException("Valid Purchase Price is required");
        }
        if (returnEntity.getReasonForReturn() == null || returnEntity.getReasonForReturn().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason for Return is required");
        }
        if (returnEntity.getReturnDate() == null || returnEntity.getReturnDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Return Date is required");
        }

        // Validate productId exists
        Product product = productRepository.findByProductId(returnEntity.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("Product ID does not exist");
        }

        // Verify supplierName matches product
        try {
            String productSupplier = product.getCategoryDetails() != null
                    ? new org.json.JSONObject(product.getCategoryDetails()).optString("supplierName", "Unknown")
                    : "Unknown";
            if (!returnEntity.getSupplierName().equals(productSupplier)) {
                returnEntity.setSupplierName(productSupplier);
            }
        } catch (Exception e) {
            returnEntity.setSupplierName("Unknown");
        }

        return returnRepository.save(returnEntity);
    }

    public Optional<Return> updateReturn(Long id, Return returnDetails) {
        Optional<Return> optionalReturn = returnRepository.findById(id);
        if (optionalReturn.isPresent()) {
            Return existingReturn = optionalReturn.get();
            existingReturn.setReturnedToSupplierDate(returnDetails.getReturnedToSupplierDate());
            existingReturn.setStatus(returnDetails.getStatus());
            return Optional.of(returnRepository.save(existingReturn));
        }
        return Optional.empty();
    }
}