package net.javaguides.ims_backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CategoryDTO {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    private List<String> allowedSubcategories;

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<String> getAllowedSubcategories() {
        return allowedSubcategories;
    }

    public void setAllowedSubcategories(List<String> allowedSubcategories) {
        this.allowedSubcategories = allowedSubcategories;
    }
}