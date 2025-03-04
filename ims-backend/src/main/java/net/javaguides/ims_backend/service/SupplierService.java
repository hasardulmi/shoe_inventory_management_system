package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.SupplierDto;
import net.javaguides.ims_backend.entity.Supplier;
import net.javaguides.ims_backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    // Get all suppliers
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get a supplier by ID
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        return supplier != null ? convertToDto(supplier) : null;
    }

    // Save a new supplier
    public SupplierDto saveSupplier(SupplierDto supplierDto) {
        Supplier supplier = convertToEntity(supplierDto);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDto(savedSupplier);
    }

    // Update an existing supplier
    public SupplierDto updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier existingSupplier = supplierRepository.findById(id).orElse(null);
        if (existingSupplier != null) {
            existingSupplier.setSupplierFirstName(supplierDto.getSupplierFirstName());
            existingSupplier.setSupplierLastName(supplierDto.getSupplierLastName());
            existingSupplier.setSupplierEmail(supplierDto.getSupplierEmail());
            existingSupplier.setSupplierPhoneNum(supplierDto.getSupplierPhoneNum());
            existingSupplier.setSupplierAddress(supplierDto.getSupplierAddress());
            existingSupplier.setSupplierBrandName(supplierDto.getSupplierBrandName());
            Supplier updatedSupplier = supplierRepository.save(existingSupplier);
            return convertToDto(updatedSupplier);
        }
        return null;
    }

    // Delete a supplier
    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    // Convert Entity to DTO
    private SupplierDto convertToDto(Supplier supplier) {
        SupplierDto supplierDto = new SupplierDto();
        supplierDto.setId(supplier.getId());
        supplierDto.setSupplierFirstName(supplier.getSupplierFirstName());
        supplierDto.setSupplierLastName(supplier.getSupplierLastName());
        supplierDto.setSupplierEmail(supplier.getSupplierEmail());
        supplierDto.setSupplierPhoneNum(supplier.getSupplierPhoneNum());
        supplierDto.setSupplierAddress(supplier.getSupplierAddress());
        supplierDto.setSupplierBrandName(supplier.getSupplierBrandName());
        return supplierDto;
    }

    // Convert DTO to Entity
    private Supplier convertToEntity(SupplierDto supplierDto) {
        Supplier supplier = new Supplier();
        supplier.setId(supplierDto.getId());
        supplier.setSupplierFirstName(supplierDto.getSupplierFirstName());
        supplier.setSupplierLastName(supplierDto.getSupplierLastName());
        supplier.setSupplierEmail(supplierDto.getSupplierEmail());
        supplier.setSupplierPhoneNum(supplierDto.getSupplierPhoneNum());
        supplier.setSupplierAddress(supplierDto.getSupplierAddress());
        supplier.setSupplierBrandName(supplierDto.getSupplierBrandName());
        return supplier;
    }
}