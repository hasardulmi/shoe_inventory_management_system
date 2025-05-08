package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "returns")
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "sale_id")
    private Long saleId;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "reason")
    private String reason;

    @ElementCollection
    @CollectionTable(name = "return_size_quantities", joinColumns = @JoinColumn(name = "return_id"))
    @MapKeyColumn(name = "size")
    @Column(name = "quantity")
    private Map<String, Integer> sizeQuantities;

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
}