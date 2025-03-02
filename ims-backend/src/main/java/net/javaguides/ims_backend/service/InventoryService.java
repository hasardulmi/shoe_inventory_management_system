package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Inventory;
import net.javaguides.ims_backend.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    // Get all inventory items
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Get an inventory item by ID
    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id).orElse(null);
    }

    // Save a new inventory item
    public Inventory saveInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    // Update an existing inventory item
    public Inventory updateInventory(Long id, Inventory inventory) {
        Inventory existingInventory = inventoryRepository.findById(id).orElse(null);
        if (existingInventory != null) {
            existingInventory.setInventoryName(inventory.getInventoryName());
            existingInventory.setInventoryDescription(inventory.getInventoryDescription());
            existingInventory.setInventoryCategory(inventory.getInventoryCategory());
            existingInventory.setInventoryUnitPrice(inventory.getInventoryUnitPrice());
            existingInventory.setInventoryQuantity(inventory.getInventoryQuantity());
            existingInventory.setSupplierName(inventory.getSupplierName());
            return inventoryRepository.save(existingInventory);
        }
        return null;
    }

    // Delete an inventory item
    public void deleteInventory(Long id) {
        inventoryRepository.deleteById(id);
    }
}