package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.SaleDTO;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.service.SalesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:3000")
public class SalesController {

    private static final Logger logger = LoggerFactory.getLogger(SalesController.class);

    @Autowired
    private SalesService salesService;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductDetails(@PathVariable String productId) {
        try {
            if (productId == null || productId.trim().isEmpty()) {
                throw new IllegalArgumentException("Product ID is null or empty");
            }
            Product product = salesService.getProductDetails(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("productName", product.getName() != null ? product.getName() : "Unknown Product");
            response.put("image", product.getImage() != null ? java.util.Base64.getEncoder().encodeToString(product.getImage()) : null);
            response.put("categoryName", product.getCategory() != null ? product.getCategory().getCategoryName() : "N/A");
            response.put("subcategories", product.getSubcategories() != null ? product.getSubcategories() : new HashMap<>());
            response.put("hasSizes", product.getHasSizes() != null ? product.getHasSizes() : false);
            response.put("sizeQuantities", product.getSizeQuantities() != null ? product.getSizeQuantities().stream().map(sq -> Map.of("size", sq.getSize(), "quantity", sq.getQuantity())).toList() : new java.util.ArrayList<>());
            response.put("sellingPrice", product.getSellingPrice() != null ? product.getSellingPrice() : 0.0);

            logger.info("Product details for productId {}: {}", productId, response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching product details for productId {}: {}", productId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Transactional(readOnly = true)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllSales() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Sale> sales = entityManager.createQuery(
                            "SELECT s FROM Sale s JOIN FETCH s.sizeQuantities", Sale.class)
                    .getResultList();
            logger.info("Fetched {} sales from the database: {}", sales.size(), sales);
            List<SaleDTO> saleDTOs = sales.stream().map(sale -> {
                SaleDTO dto = new SaleDTO();
                dto.setId(sale.getId());
                dto.setProductId(sale.getProductId());
                try {
                    Product product = salesService.getProductDetails(sale.getProductId());
                    dto.setProductName(product.getName() != null ? product.getName() : "Unknown Product");
                    dto.setImage(product.getImage());
                    dto.setCategory(product.getCategory() != null ? product.getCategory().getCategoryName() : "N/A");
                    dto.setSubcategories(product.getSubcategories());
                    dto.setSellingPrice(product.getSellingPrice() != null ? product.getSellingPrice() : 0.0);
                } catch (Exception e) {
                    logger.warn("Product not found for sale with productId {}: {}", sale.getProductId(), e.getMessage());
                    dto.setProductName("Product Not Found");
                    dto.setImage(null);
                    dto.setCategory("N/A");
                    dto.setSubcategories(new HashMap<>());
                    dto.setSellingPrice(0.0);
                }
                LocalDate saleDate = sale.getSaleDate();
                dto.setSaleDate(saleDate); // Set LocalDate directly
                dto.setQuantity(sale.getQuantity());
                dto.setSizeQuantities(sale.getSizeQuantities());
                dto.setDiscount(sale.getDiscount());
                dto.setTotalSellingPrice(sale.getTotalSellingPrice());
                logger.debug("Mapped SaleDTO: {}", dto);
                return dto;
            }).collect(Collectors.toList());
            logger.info("Successfully mapped {} sales to DTOs: {}", saleDTOs.size(), saleDTOs);
            response.put("data", saleDTOs);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching all sales: {}", e.getMessage(), e);
            response.put("data", new ArrayList<>());
            response.put("success", false);
            response.put("error", "Failed to fetch sales: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody SaleDTO saleDTO) {
        try {
            String productId = saleDTO.getProductId();
            if (productId == null || productId.trim().isEmpty()) {
                throw new IllegalArgumentException("Product ID is null or empty");
            }
            // Set current date if not provided
            if (saleDTO.getSaleDate() == null) {
                saleDTO.setSaleDate(LocalDate.now());
            }
            Product product = salesService.getProductDetails(productId);
            List<SaleDTO> savedSales = salesService.createSale(saleDTO);
            SaleDTO savedSale = savedSales.get(0);
            Map<String, Object> response = new HashMap<>();
            response.put("sale", savedSale);
            response.put("invoice", generateInvoice(savedSale, product));
            logger.info("Successfully created sale with ID {}: {}", savedSale.getId(), response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating sale: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        try {
            Sale sale = entityManager.find(Sale.class, id);
            if (sale == null) {
                throw new IllegalArgumentException("Sale not found with ID: " + id);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("productId", sale.getProductId());
            response.put("sizeQuantities", sale.getSizeQuantities() != null ? sale.getSizeQuantities() : new HashMap<>());
            response.put("quantity", sale.getQuantity());
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching sale with ID {}: {}", id, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    private Map<String, String> generateInvoice(SaleDTO saleDTO, Product product) {
        Map<String, String> invoice = new HashMap<>();
        invoice.put("shopName", "Sarasi Shoe Shop");
        invoice.put("saleId", saleDTO.getId() != null ? saleDTO.getId().toString() : "N/A");
        invoice.put("productId", saleDTO.getProductId());
        invoice.put("productName", product.getName() != null ? product.getName() : "Unknown Product");
        invoice.put("quantity", product.getHasSizes() ?
                saleDTO.getSizeQuantities().entrySet().stream()
                        .map(entry -> "Size " + entry.getKey() + ": " + entry.getValue())
                        .collect(Collectors.joining(", ")) :
                saleDTO.getQuantity().toString());
        invoice.put("sellingPrice", product.getSellingPrice() != null ? product.getSellingPrice().toString() : "0.0");
        invoice.put("discount", saleDTO.getDiscount() != null ? saleDTO.getDiscount().toString() : "0.0");
        invoice.put("totalSellingPrice", saleDTO.getTotalSellingPrice().toString());
        return invoice;
    }
}