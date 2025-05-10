package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Supplier;
import net.javaguides.ims_backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Transactional
    public Supplier addSupplier(Supplier supplier) {
        if (supplierRepository.existsByCompanyName(supplier.getCompanyName())) {
            throw new RuntimeException("Supplier already exists");
        }
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Update fields
        existingSupplier.setCompanyName(updatedSupplier.getCompanyName());
        existingSupplier.setFirstName(updatedSupplier.getFirstName());
        existingSupplier.setLastName(updatedSupplier.getLastName());
        existingSupplier.setEmail(updatedSupplier.getEmail());
        existingSupplier.setPhoneNumber(updatedSupplier.getPhoneNumber());
        existingSupplier.setAddress(updatedSupplier.getAddress());
        existingSupplier.setBrandName(updatedSupplier.getBrandName());

        return supplierRepository.save(existingSupplier);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found");
        }
        supplierRepository.deleteById(id);
    }
}