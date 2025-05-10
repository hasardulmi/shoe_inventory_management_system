package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.SaleDTO;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.entity.SizeQuantity;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.SalesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SalesService {

    private static final Logger logger = LoggerFactory.getLogger(SalesService.class);

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public List<Sale> getAllSales() {
        try {
            List<Sale> sales = salesRepository.findAll();
            // Force initialization of sizeQuantities to avoid lazy loading issues
            sales.forEach(sale -> {
                if (sale.getSizeQuantities() != null) {
                    sale.getSizeQuantities().forEach((size, qty) -> {});
                }
            });
            logger.info("Successfully fetched {} sales from the database: {}", sales.size(), sales);
            return sales;
        } catch (Exception e) {
            logger.error("Error fetching sales from repository: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch sales: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Product getProductDetails(String productId) {
        try {
            Product product = productRepository.findByProductId(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
            if (product.getSizeQuantities() != null) {
                product.getSizeQuantities().forEach(sq -> {
                    if (sq != null) sq.getQuantity();
                });
            }
            if (product.getSubcategories() != null) {
                product.getSubcategories().size();
            }
            logger.info("Successfully fetched product details for productId: {}", productId);
            return product;
        } catch (Exception e) {
            logger.error("Error fetching product details for productId {}: {}", productId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch product details: " + e.getMessage(), e);
        }
    }

    @Transactional
    public List<SaleDTO> createSale(SaleDTO saleDTO) {
        try {
            Product product = getProductDetails(saleDTO.getProductId());
            Sale sale = new Sale();
            sale.setProductId(saleDTO.getProductId());
            sale.setSaleDate(LocalDate.now());
            sale.setQuantity(saleDTO.getQuantity());
            sale.setSizeQuantities(saleDTO.getSizeQuantities());
            sale.setDiscount(saleDTO.getDiscount());

            double sellingPrice = product.getSellingPrice() != null ? product.getSellingPrice() : 0.0;
            double discount = saleDTO.getDiscount() != null ? saleDTO.getDiscount() : 0.0;
            double totalQuantity = saleDTO.getSizeQuantities() != null ?
                    saleDTO.getSizeQuantities().values().stream().mapToInt(Integer::intValue).sum() :
                    (saleDTO.getQuantity() != null ? saleDTO.getQuantity() : 0);
            double totalSellingPrice = (sellingPrice * totalQuantity) - discount;
            sale.setTotalSellingPrice(totalSellingPrice);

            if (sale.getSizeQuantities() != null) {
                sale.getSizeQuantities().forEach((size, qty) -> {});
            }

            Sale savedSale = salesRepository.save(sale);
            logger.info("Successfully saved sale with ID: {}", savedSale.getId());

            if (product.getSizeQuantities() != null && saleDTO.getSizeQuantities() != null) {
                Map<String, Integer> productSizeQuantities = product.getSizeQuantities().stream()
                        .collect(Collectors.toMap(
                                sq -> sq.getSize(),
                                sq -> sq.getQuantity(),
                                (q1, q2) -> q1
                        ));

                saleDTO.getSizeQuantities().forEach((size, qty) -> {
                    Integer currentQty = productSizeQuantities.getOrDefault(size, 0);
                    if (currentQty < qty) {
                        throw new RuntimeException("Insufficient quantity for size: " + size);
                    }
                    productSizeQuantities.put(size, currentQty - qty);
                });

                product.getSizeQuantities().clear();
                productSizeQuantities.forEach((size, qty) -> {
                    SizeQuantity sq = new SizeQuantity();
                    sq.setProduct(product);
                    sq.setSize(size);
                    sq.setQuantity(qty);
                    product.getSizeQuantities().add(sq);
                });
            } else if (saleDTO.getQuantity() != null && product.getQuantity() != null) {
                if (product.getQuantity() < saleDTO.getQuantity()) {
                    throw new RuntimeException("Insufficient quantity for product");
                }
                product.setQuantity(product.getQuantity() - saleDTO.getQuantity());
            }
            productRepository.save(product);

            SaleDTO result = new SaleDTO();
            result.setId(savedSale.getId());
            result.setProductId(savedSale.getProductId());
            result.setProductName(product.getName());
            result.setImage(product.getImage());
            result.setCategory(product.getCategory() != null ? product.getCategory().getCategoryName() : "N/A");
            result.setSubcategories(product.getSubcategories());
            result.setSaleDate(savedSale.getSaleDate());
            result.setQuantity(savedSale.getQuantity());
            result.setSizeQuantities(savedSale.getSizeQuantities());
            result.setSellingPrice(product.getSellingPrice());
            result.setDiscount(savedSale.getDiscount());
            result.setTotalSellingPrice(savedSale.getTotalSellingPrice());

            logger.info("Created SaleDTO: {}", result);
            return List.of(result);
        } catch (Exception e) {
            logger.error("Error creating sale: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create sale: " + e.getMessage(), e);
        }
    }
}