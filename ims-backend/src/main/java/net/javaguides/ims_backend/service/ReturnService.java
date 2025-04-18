package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.ReturnRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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
        // Validate productId
        if (returnEntity.getProductId() == null || returnEntity.getProductId().isEmpty()) {
            throw new IllegalArgumentException("Product ID is required");
        }
        Product product = productRepository.findByProductId(returnEntity.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + returnEntity.getProductId()));

        // Check if already returned
        if (product.getStatus().equals("RETURNED")) {
            throw new IllegalArgumentException("Product is already returned");
        }

        // Validate reason
        if (returnEntity.getReason() == null || returnEntity.getReason().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }

        // Validate returnDate
        if (returnEntity.getReturnDate() == null) {
            throw new IllegalArgumentException("Return date is required");
        }

        return returnRepository.save(returnEntity);
    }

    public Return markReturnAsCompleted(Long returnId, LocalDate returnedDate) {
        Return returnEntity = returnRepository.findById(returnId)
                .orElseThrow(() -> new IllegalArgumentException("Return not found: " + returnId));

        if (returnEntity.getReturnedDate() != null) {
            throw new IllegalArgumentException("Product is already marked as returned");
        }

        returnEntity.setReturnedDate(returnedDate);
        return returnRepository.save(returnEntity);
    }
}