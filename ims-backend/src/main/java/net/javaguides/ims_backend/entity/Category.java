package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(columnNames = "category_name"))
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @ElementCollection
    @CollectionTable(name = "category_subcategories", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "subcategory_name")
    private List<String> allowedSubcategories;

    public Category() {}

    public Category(String categoryName, List<String> allowedSubcategories) {
        this.categoryName = categoryName;
        this.allowedSubcategories = allowedSubcategories;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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