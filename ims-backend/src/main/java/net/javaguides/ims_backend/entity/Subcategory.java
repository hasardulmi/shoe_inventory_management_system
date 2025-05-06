//package net.javaguides.ims_backend.entity;
//
//import jakarta.persistence.*;
//import jakarta.validation.constraints.NotBlank;
//
//@Entity
//@Table(name = "subcategories")
//public class Subcategory {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne
//    @JoinColumn(name = "category_id", nullable = false)
//    private Category category;
//
//    @NotBlank(message = "Subcategory name is required")
//    @Column(name = "subcategory_name")
//    private String subcategoryName;
//
//    @Column(name = "subcategory_value") // Removed @NotBlank, now optional
//    private String subcategoryValue;
//
//    public Subcategory() {}
//
//    public Subcategory(Category category, String subcategoryName, String subcategoryValue) {
//        this.category = category;
//        this.subcategoryName = subcategoryName;
//        this.subcategoryValue = subcategoryValue;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//    public Category getCategory() {
//        return category;
//    }
//
//    public void setCategory(Category category) {
//        this.category = category;
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