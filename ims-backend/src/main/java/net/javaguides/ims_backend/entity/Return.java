// src/main/java/net/javaguides/ims_backend/entity/Return.java
package net.javaguides.ims_backend.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "returns")
@Data
public class Return {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(name = "purchase_price", nullable = false)
    private Double purchasePrice;

    @Column(name = "reason_for_return", nullable = false)
    private String reasonForReturn;

    @Column(name = "return_date", nullable = false)
    private String returnDate;

    @Column(name = "returned_to_supplier_date")
    private String returnedToSupplierDate;

    @Column(name = "status", nullable = false)
    private String status;
}