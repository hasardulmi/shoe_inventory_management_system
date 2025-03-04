package net.javaguides.ims_backend.dto;

public class SupplierDto {

    private Long id;
    private String supplierFirstName;
    private String supplierLastName;
    private String supplierEmail;
    private String supplierPhoneNum;
    private String supplierAddress;
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