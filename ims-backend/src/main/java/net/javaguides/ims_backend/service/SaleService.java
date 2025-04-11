// src/main/java/net/javaguides/ims_backend/service/SaleService.java
package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Sale createSale(Sale sale) {
        return saleRepository.save(sale);
    }
}