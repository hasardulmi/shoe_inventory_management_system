package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_first_name", nullable = false)
    private String supplierFirstName;

    @Column(name = "supplier_last_name", nullable = false)
    private String supplierLastName;

    @Column(name = "supplier_email", nullable = false, unique = true)
    private String supplierEmail;

    @Column(name = "supplier_phone_num", nullable = false)
    private String supplierPhoneNum;

    @Column(name = "supplier_address", nullable = false)
    private String supplierAddress;

    @Column(name = "supplier_brand_name", nullable = false)
    private String supplierBrandName;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSupplierFirstName() {
        return supplierFirstName;
    }

    public void setSupplierFirstName(String supplierFirstName) {
        this.supplierFirstName = supplierFirstName;
    }

    public String getSupplierLastName() {
        return supplierLastName;
    }

    public void setSupplierLastName(String supplierLastName) {
        this.supplierLastName = supplierLastName;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSupplierPhoneNum() {
        return supplierPhoneNum;
    }

    public void setSupplierPhoneNum(String supplierPhoneNum) {
        this.supplierPhoneNum = supplierPhoneNum;
    }

    public String getSupplierAddress() {
        return supplierAddress;
    }

    public void setSupplierAddress(String supplierAddress) {
        this.supplierAddress = supplierAddress;
    }

    public String getSupplierBrandName() {
        return supplierBrandName;
    }

    public void setSupplierBrandName(String supplierBrandName) {
        this.supplierBrandName = supplierBrandName;
    }
}