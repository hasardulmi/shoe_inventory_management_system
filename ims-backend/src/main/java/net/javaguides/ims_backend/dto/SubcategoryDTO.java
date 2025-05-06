//package net.javaguides.ims_backend.dto;
//
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//
//public class SubcategoryDTO {
//
//    @NotNull(message = "Category ID is required")
//    private Long categoryId;
//
//    @NotBlank(message = "Subcategory name is required")
//    private String subcategoryName;
//
//    private String subcategoryValue; // Removed @NotBlank, now optional
//
//    public Long getCategoryId() {
//        return categoryId;
//    }
//
//    public void setCategoryId(Long categoryId) {
//        this.categoryId = categoryId;
//    }
//
//    public String getSubcategoryName() {
//        return subcategoryName;
//    }
//
//    public void setSubcategoryName(String subcategoryName) {
//        this.subcategoryName = subcategoryName;
//    }
//
//    public String getSubcategoryValue() {
//        return subcategoryValue;
//    }
//
//    public void setSubcategoryValue(String subcategoryValue) {
//        this.subcategoryValue = subcategoryValue;
//    }
//}