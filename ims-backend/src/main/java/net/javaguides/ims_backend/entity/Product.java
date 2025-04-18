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

    @Column(name = "product_id", nullable = false, unique = true)
    private String productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "brand_name")
    private String brandName;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", nullable = false)
    private BigDecimal purchasePrice;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "in_stock", nullable = false)
    private boolean inStock;

    @Column(name = "category_details")
    private String categoryDetails;

    @Column(name = "status", nullable = false)
    private String status;

    // Constructors
    public Product() {}

    public Product(String productId, String productName, String supplierName, String brandName,
                   LocalDate purchaseDate, BigDecimal purchasePrice, BigDecimal sellingPrice,
                   String category, boolean inStock, String categoryDetails, String status) {
        this.productId = productId;
        this.productName = productName;
        this.supplierName = supplierName;
        this.brandName = brandName;
        this.purchaseDate = purchaseDate;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.category = category;
        this.inStock = inStock;
        this.categoryDetails = categoryDetails;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean getInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }

    public String getCategoryDetails() { return categoryDetails; }
    public void setCategoryDetails(String categoryDetails) { this.categoryDetails = categoryDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}