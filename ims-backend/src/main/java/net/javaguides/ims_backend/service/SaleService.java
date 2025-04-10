// src/main/java/net/javaguides/ims_backend/service/SaleService.java
package net.javaguides.ims_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.repository.SaleRepository;

import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    public Sale createSale(Sale sale) {
        return saleRepository.save(sale);
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}