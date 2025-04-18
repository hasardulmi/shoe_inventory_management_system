package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "returns")
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "purchase_price", nullable = false)
    private BigDecimal purchasePrice;

    @Column(name = "reason_for_return", nullable = false)
    private String reasonForReturn;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "returned_to_supplier_date")
    private LocalDate returnedToSupplierDate;

    @Column(name = "supplier_name")
    private String supplierName;

    // Constructors
    public Return() {}

    public Return(String productId, String brandName, BigDecimal purchasePrice, String reasonForReturn, LocalDate returnDate, String status, LocalDate returnedToSupplierDate, String supplierName) {
        this.productId = productId;
        this.brandName = brandName;
        this.purchasePrice = purchasePrice;
        this.reasonForReturn = reasonForReturn;
        this.returnDate = returnDate;
        this.status = status;
        this.returnedToSupplierDate = returnedToSupplierDate;
        this.supplierName = supplierName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public String getReasonForReturn() { return reasonForReturn; }
    public void setReasonForReturn(String reasonForReturn) { this.reasonForReturn = reasonForReturn; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getReturnedToSupplierDate() { return returnedToSupplierDate; }
    public void setReturnedToSupplierDate(LocalDate returnedToSupplierDate) { this.returnedToSupplierDate = returnedToSupplierDate; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
}