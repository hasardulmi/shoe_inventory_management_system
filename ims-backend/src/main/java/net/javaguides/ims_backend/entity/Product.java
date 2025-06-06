package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    private String productId; // No longer required, generated automatically

    @NotNull(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Category is required")
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @NotNull(message = "Purchase price is required")
    private Double purchasePrice;

    @NotNull(message = "Selling price is required")
    private Double sellingPrice;

    private String brandName;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    private Boolean inStock;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_subcategories", joinColumns = @JoinColumn(name = "product_id"))
    @MapKeyColumn(name = "subcategory_name")
    @Column(name = "subcategory_value")
    private Map<String, String> subcategories = new HashMap<>();

    @Column(name = "has_sizes")
    private Boolean hasSizes;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SizeQuantity> sizeQuantities;

    @Column(name = "quantity")
    private Integer quantity; // For products without sizes

    @Lob
    @Column(name = "image", columnDefinition = "LONGBLOB")
    private byte[] image;

    public Product() {
        this.subcategories = new HashMap<>();
    }

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }

    public Map<String, String> getSubcategories() {
        return subcategories;
    }

    public void setSubcategories(Map<String, String> subcategories) {
        this.subcategories = subcategories != null ? subcategories : new HashMap<>();
    }

    public Boolean getHasSizes() {
        return hasSizes;
    }

    public void setHasSizes(Boolean hasSizes) {
        this.hasSizes = hasSizes;
    }

    public List<SizeQuantity> getSizeQuantities() {
        return sizeQuantities;
    }

    public void setSizeQuantities(List<SizeQuantity> sizeQuantities) {
        this.sizeQuantities = sizeQuantities;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }
}