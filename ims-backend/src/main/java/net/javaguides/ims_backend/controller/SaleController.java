package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:3000")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        List<Sale> sales = saleService.getAllSales();
        return new ResponseEntity<>(sales, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody Sale sale) {
        try {
            Sale createdSale = saleService.createSale(sale);
            return new ResponseEntity<>(createdSale, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}