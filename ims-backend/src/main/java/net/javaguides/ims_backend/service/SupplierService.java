// src/main/java/net/javaguides/ims_backend/service/SupplierService.java
package net.javaguides.ims_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import net.javaguides.ims_backend.entity.Supplier;
import net.javaguides.ims_backend.repository.SupplierRepository;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(Long id, Supplier supplier) {
        Supplier existing = supplierRepository.findById(id).orElseThrow();
        existing.setSupplierFirstName(supplier.getSupplierFirstName());
        existing.setSupplierLastName(supplier.getSupplierLastName());
        existing.setSupplierEmail(supplier.getSupplierEmail());
        existing.setSupplierPhoneNum(supplier.getSupplierPhoneNum());
        existing.setSupplierAddress(supplier.getSupplierAddress());
        existing.setSupplierBrandName(supplier.getSupplierBrandName());
        return supplierRepository.save(existing);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }
}