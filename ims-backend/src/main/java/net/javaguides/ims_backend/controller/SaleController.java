// src/main/java/net/javaguides/ims_backend/controller/SaleController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        try {
            List<Sale> sales = saleRepository.findAll();
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody Sale sale) {
        try {
            Product product = productRepository.findByProductId(sale.getProductId());
            if (product == null) {
                return ResponseEntity.badRequest().body(null);
            }
            if (!product.getInStock()) {
                return ResponseEntity.status(400).body(null); // Product out of stock
            }
            product.setInStock(false); // Mark product as sold
            productRepository.save(product);
            Sale savedSale = saleRepository.save(sale);
            return ResponseEntity.ok(savedSale);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(null);
        }
    }
}