package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", unique = true, nullable = false)
    private String productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", nullable = false)
    private BigDecimal purchasePrice;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "in_stock")
    private Boolean inStock;

    @Column(name = "category_details")
    private String categoryDetails;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "supplier_name", nullable = true)
    private String supplierName;

    @Column(name = "brand_name", nullable = true)
    private String brandName;

    // Constructors
    public Product() {}

    public Product(String productId, String productName, LocalDate purchaseDate, BigDecimal purchasePrice, BigDecimal sellingPrice, String category, Boolean inStock, String categoryDetails, String status, String supplierName, String brandName) {
        this.productId = productId;
        this.productName = productName;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.category = category;
        this.inStock = inStock;
        this.categoryDetails = categoryDetails;
        this.status = status;
        this.supplierName = supplierName;
        this.brandName = brandName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }

    public String getCategoryDetails() { return categoryDetails; }
    public void setCategoryDetails(String categoryDetails) { this.categoryDetails = categoryDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
}