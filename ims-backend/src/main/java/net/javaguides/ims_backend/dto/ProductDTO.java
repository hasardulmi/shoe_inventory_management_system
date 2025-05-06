package net.javaguides.ims_backend.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProductDTO {

    private Long id;

    private String productId; // No longer required, generated automatically

    @NotBlank(message = "Product name is required")
    private String productName;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Purchase price is required")
    private Double purchasePrice;

    @NotNull(message = "Selling price is required")
    private Double sellingPrice;

    private String brandName;

    @NotBlank(message = "Purchase date is required")
    private String purchaseDate;

    private Boolean inStock;

    private Map<String, String> subcategories;

    private Boolean hasSizes;

    private List<SizeQuantityDTO> sizeQuantities;

    private Integer quantity; // For products without sizes

    private String image; // Base64 encoded string for frontend

    public ProductDTO() {
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

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
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

    public List<SizeQuantityDTO> getSizeQuantities() {
        return sizeQuantities;
    }

    public void setSizeQuantities(List<SizeQuantityDTO> sizeQuantities) {
        this.sizeQuantities = sizeQuantities;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}