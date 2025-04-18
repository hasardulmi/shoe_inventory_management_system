package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Sale createSale(Sale sale) {
        // Validate productId
        if (sale.getProductId() == null || sale.getProductId().isEmpty()) {
            throw new IllegalArgumentException("Product ID is required");
        }
        Product product = productRepository.findByProductId(sale.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + sale.getProductId()));

        // Validate product status and stock
        if (product.getStatus().equals("RETURNED")) {
            throw new IllegalArgumentException("Product is returned and cannot be sold");
        }
        if (!product.getInStock()) {
            throw new IllegalArgumentException("Product is not in stock");
        }

        // Validate salePrice
        if (sale.getSalePrice() == null || sale.getSalePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valid sale price is required");
        }

        // Validate discount
        if (sale.getDiscount() != null && (sale.getDiscount().compareTo(BigDecimal.ZERO) < 0 || sale.getDiscount().compareTo(BigDecimal.ONE) > 0)) {
            throw new IllegalArgumentException("Discount must be between 0 and 100%");
        }

        // Validate salePrice against product.sellingPrice
        BigDecimal expectedSalePrice = product.getSellingPrice();
        if (sale.getDiscount() != null) {
            expectedSalePrice = product.getSellingPrice().multiply(BigDecimal.ONE.subtract(sale.getDiscount()));
        }
        if (sale.getSalePrice().compareTo(expectedSalePrice) != 0) {
            throw new IllegalArgumentException("Sale price does not match expected price after discount");
        }

        // Update product stock
        product.setInStock(false);
        productRepository.save(product);

        return saleRepository.save(sale);
    }
}