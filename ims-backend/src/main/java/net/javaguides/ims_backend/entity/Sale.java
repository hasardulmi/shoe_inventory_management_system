package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "sale_price", nullable = false)
    private BigDecimal salePrice;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(name = "discount")
    private BigDecimal discount;

    // Constructors
    public Sale() {}

    public Sale(String productId, BigDecimal salePrice, LocalDate saleDate, BigDecimal discount) {
        this.productId = productId;
        this.salePrice = salePrice;
        this.saleDate = saleDate;
        this.discount = discount;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }

    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }
}