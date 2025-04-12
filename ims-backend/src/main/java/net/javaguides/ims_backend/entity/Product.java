// src/main/java/net/javaguides/ims_backend/entity/Product.java
package net.javaguides.ims_backend.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", unique = true, nullable = false)
    private String productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "purchase_date", nullable = false)
    private String purchaseDate;

    @Column(name = "purchase_price", nullable = false)
    private Double purchasePrice;

    @Column(name = "selling_price", nullable = false)
    private Double sellingPrice;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "in_stock", nullable = false)
    private Boolean inStock;

    @Column(name = "category_details", columnDefinition = "TEXT")
    private String categoryDetails;
}