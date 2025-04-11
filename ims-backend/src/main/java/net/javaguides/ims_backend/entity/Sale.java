// src/main/java/net/javaguides/ims_backend/entity/Sale.java
package net.javaguides.ims_backend.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sales")
@Data
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "sold_price", nullable = false)
    private Double soldPrice;

    @Column(name = "sold_date", nullable = false)
    private String soldDate;

    @Column(name = "discount_percentage")
    private Double discountPercentage;

    @Column(name = "discount_price")
    private Double discountPrice;

    @Column(name = "final_sold_price", nullable = false)
    private Double finalSoldPrice;
}