package net.javaguides.ims_backend.dto;

import java.time.LocalDate;
import java.util.Map;

public class ReturnDTO {
    private Long id;
    private String productId;
    private String productName;
    private Long saleId;
    private LocalDate returnDate;
    private String reason;
    private Map<String, Integer> sizeQuantities;
    private String condition; // New field for return condition

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Map<String, Integer> getSizeQuantities() {
        return sizeQuantities;
    }

    public void setSizeQuantities(Map<String, Integer> sizeQuantities) {
        this.sizeQuantities = sizeQuantities;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }
}