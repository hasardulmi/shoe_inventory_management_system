// src/main/java/net/javaguides/ims_backend/entity/Sale.java
package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "sold_price", nullable = false)
    private Double soldPrice;

    @Column(name = "sold_date", nullable = false)
    private LocalDate soldDate;

    @Column(name = "has_discount", nullable = false)
    private Boolean hasDiscount;

    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "discount_price", nullable = false)
    private Double discountPrice;

    @Column(name = "final_sold_price", nullable = false)
    private Double finalSoldPrice;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public Double getSoldPrice() { return soldPrice; }
    public void setSoldPrice(Double soldPrice) { this.soldPrice = soldPrice; }
    public LocalDate getSoldDate() { return soldDate; }
    public void setSoldDate(LocalDate soldDate) { this.soldDate = soldDate; }
    public Boolean getHasDiscount() { return hasDiscount; }
    public void setHasDiscount(Boolean hasDiscount) { this.hasDiscount = hasDiscount; }
    public Double getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }
    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }
    public Double getFinalSoldPrice() { return finalSoldPrice; }
    public void setFinalSoldPrice(Double finalSoldPrice) { this.finalSoldPrice = finalSoldPrice; }
}