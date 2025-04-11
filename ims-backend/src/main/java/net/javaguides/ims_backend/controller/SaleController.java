// src/main/java/net/javaguides/ims_backend/controller/SaleController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody Sale sale) {
        try {
            Sale savedSale = saleService.createSale(sale);
            return ResponseEntity.ok(savedSale);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}