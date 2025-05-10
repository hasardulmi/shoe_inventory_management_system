package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Supplier;
import net.javaguides.ims_backend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@Valid @RequestBody Supplier supplier) {
        try {
            Supplier savedSupplier = supplierService.addSupplier(supplier);
            return ResponseEntity.ok(savedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @Valid @RequestBody Supplier supplier) {
        try {
            Supplier updatedSupplier = supplierService.updateSupplier(id, supplier);
            return ResponseEntity.ok(updatedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            return ResponseEntity.ok("{\"message\":\"Supplier deleted successfully\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}