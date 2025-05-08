package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.ReturnDTO;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.entity.Sale;
import net.javaguides.ims_backend.entity.SizeQuantity;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.ReturnRepository;
import net.javaguides.ims_backend.repository.SalesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReturnService {

    private static final Logger logger = LoggerFactory.getLogger(ReturnService.class);

    @Autowired
    private ReturnRepository returnRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesRepository salesRepository;

    @Transactional
    public ReturnDTO createReturn(ReturnDTO returnDTO) {
        try {
            // Validate the condition and required fields
            String condition = returnDTO.getCondition();
            if (condition == null || condition.isEmpty()) {
                throw new IllegalArgumentException("Return condition must be specified");
            }

            if (!List.of("ADD_PRODUCT_QUANTITY", "DEDUCT_SALE_QUANTITY", "DEDUCT_PRODUCT_QUANTITY").contains(condition)) {
                throw new IllegalArgumentException("Invalid return condition: " + condition);
            }

            // Validate required fields based on condition
            if ("ADD_PRODUCT_QUANTITY".equals(condition)) {
                if (returnDTO.getProductId() == null || returnDTO.getProductId().isEmpty() || returnDTO.getSaleId() == null) {
                    throw new IllegalArgumentException("Both Product ID and Sale ID are required for 'Add Product Quantity' condition");
                }
            } else if ("DEDUCT_SALE_QUANTITY".equals(condition)) {
                if (returnDTO.getSaleId() == null) {
                    throw new IllegalArgumentException("Sale ID is required for 'Deduct Sale Quantity' condition");
                }
            } else if ("DEDUCT_PRODUCT_QUANTITY".equals(condition)) {
                if (returnDTO.getProductId() == null || returnDTO.getProductId().isEmpty()) {
                    throw new IllegalArgumentException("Product ID is required for 'Deduct Product Quantity' condition");
                }
            }

            Product product = null;
            if (returnDTO.getProductId() != null && !returnDTO.getProductId().isEmpty()) {
                product = productRepository.findAllWithSubcategoriesAndSizes().stream()
                        .filter(p -> p.getProductId().equals(returnDTO.getProductId()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + returnDTO.getProductId()));
            }

            Sale sale = null;
            if (returnDTO.getSaleId() != null) {
                sale = salesRepository.findById(returnDTO.getSaleId())
                        .orElseThrow(() -> new IllegalArgumentException("Sale not found with ID: " + returnDTO.getSaleId()));
                if (returnDTO.getProductId() != null && !returnDTO.getProductId().isEmpty() && !sale.getProductId().equals(returnDTO.getProductId())) {
                    throw new IllegalArgumentException("Sale does not match the provided Product ID");
                }
            }

            // Validate return quantities against available quantities
            Map<String, Integer> availableQuantities;
            if (sale != null && ("ADD_PRODUCT_QUANTITY".equals(condition) || "DEDUCT_SALE_QUANTITY".equals(condition))) {
                availableQuantities = sale.getSizeQuantities();
            } else if (product != null && "DEDUCT_PRODUCT_QUANTITY".equals(condition)) {
                String productId = product.getProductId(); // Capture productId as a final variable
                availableQuantities = product.getSizeQuantities().stream()
                        .collect(Collectors.toMap(
                                SizeQuantity::getSize,
                                SizeQuantity::getQuantity,
                                (q1, q2) -> {
                                    logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", productId, q1, q2);
                                    return q1;
                                }));
            } else {
                throw new IllegalArgumentException("Cannot determine available quantities for the given condition");
            }

            // Validate return quantities
            for (Map.Entry<String, Integer> entry : returnDTO.getSizeQuantities().entrySet()) {
                String size = entry.getKey();
                Integer qty = entry.getValue();
                Integer availableQty = availableQuantities.getOrDefault(size, 0);
                if (qty > availableQty) {
                    throw new IllegalArgumentException("Return quantity (" + qty + ") for size " + size + " exceeds available quantity (" + availableQty + ")");
                }
            }

            Return returnEntity = new Return();
            returnEntity.setProductId(returnDTO.getProductId());
            returnEntity.setSaleId(returnDTO.getSaleId());
            returnEntity.setReturnDate(returnDTO.getReturnDate());
            returnEntity.setReason(returnDTO.getReason());
            returnEntity.setSizeQuantities(returnDTO.getSizeQuantities());

            Return savedReturn = returnRepository.save(returnEntity);
            updateInventories(returnDTO, product, sale);

            ReturnDTO result = new ReturnDTO();
            result.setId(savedReturn.getId());
            result.setProductId(savedReturn.getProductId());
            result.setProductName(product != null ? product.getName() : null);
            result.setSaleId(savedReturn.getSaleId());
            result.setReturnDate(savedReturn.getReturnDate());
            result.setReason(savedReturn.getReason());
            result.setSizeQuantities(savedReturn.getSizeQuantities());
            result.setCondition(condition);

            logger.info("Successfully created return with ID: {}", savedReturn.getId());
            return result;
        } catch (Exception e) {
            logger.error("Error creating return: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create return: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void updateInventories(ReturnDTO returnDTO, Product product, Sale sale) {
        Map<String, Integer> returnQuantities = returnDTO.getSizeQuantities();
        String condition = returnDTO.getCondition();

        if ("ADD_PRODUCT_QUANTITY".equals(condition)) {
            // Scenario 1: Add to product quantity, deduct from sale quantity
            if (product == null || sale == null) {
                throw new IllegalStateException("Product and Sale must be provided for 'Add Product Quantity' condition");
            }

            // Aggregate product quantities to handle duplicates
            Map<String, Integer> aggregatedProductQuantities = product.getSizeQuantities().stream()
                    .collect(Collectors.toMap(
                            SizeQuantity::getSize,
                            SizeQuantity::getQuantity,
                            (q1, q2) -> {
                                logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", product.getProductId(), q1, q2);
                                return q1;
                            }));

            // Update product quantities by adding return quantities
            for (Map.Entry<String, Integer> entry : returnQuantities.entrySet()) {
                String size = entry.getKey();
                int returnQty = entry.getValue();
                int currentQty = aggregatedProductQuantities.getOrDefault(size, 0);
                SizeQuantity existingSq = product.getSizeQuantities().stream()
                        .filter(sq -> sq.getSize().equals(size))
                        .findFirst()
                        .orElse(null);

                if (existingSq != null) {
                    existingSq.setQuantity(currentQty + returnQty);
                } else {
                    SizeQuantity newSq = new SizeQuantity();
                    newSq.setProduct(product);
                    newSq.setSize(size);
                    newSq.setQuantity(returnQty);
                    product.getSizeQuantities().add(newSq);
                }
            }

            // Update sale size quantities (deduct returned quantities)
            Map<String, Integer> saleSizeQuantities = sale.getSizeQuantities();
            Map<String, Integer> updatedSaleQuantities = new HashMap<>(saleSizeQuantities);
            for (Map.Entry<String, Integer> entry : returnQuantities.entrySet()) {
                String size = entry.getKey();
                int qty = entry.getValue();
                int currentQty = saleSizeQuantities.getOrDefault(size, 0);
                if (currentQty < qty) {
                    throw new IllegalArgumentException("Insufficient quantity in sale for size: " + size);
                }
                updatedSaleQuantities.put(size, currentQty - qty);
            }
            sale.setSizeQuantities(updatedSaleQuantities);
            salesRepository.save(sale);

            // Update product inStock status
            int totalQuantity = product.getSizeQuantities().stream()
                    .mapToInt(SizeQuantity::getQuantity)
                    .sum();
            product.setInStock(totalQuantity > 0);
            productRepository.save(product);
        } else if ("DEDUCT_SALE_QUANTITY".equals(condition)) {
            // Scenario 2: Only deduct from sale quantity
            if (sale == null) {
                throw new IllegalStateException("Sale must be provided for 'Deduct Sale Quantity' condition");
            }

            Map<String, Integer> saleSizeQuantities = sale.getSizeQuantities();
            Map<String, Integer> updatedSaleQuantities = new HashMap<>(saleSizeQuantities);
            for (Map.Entry<String, Integer> entry : returnQuantities.entrySet()) {
                String size = entry.getKey();
                int qty = entry.getValue();
                int currentQty = saleSizeQuantities.getOrDefault(size, 0);
                if (currentQty < qty) {
                    throw new IllegalArgumentException("Insufficient quantity in sale for size: " + size);
                }
                updatedSaleQuantities.put(size, currentQty - qty);
            }
            sale.setSizeQuantities(updatedSaleQuantities);
            salesRepository.save(sale);
        } else if ("DEDUCT_PRODUCT_QUANTITY".equals(condition)) {
            // Scenario 3: Only deduct from product quantity
            if (product == null) {
                throw new IllegalStateException("Product must be provided for 'Deduct Product Quantity' condition");
            }

            Map<String, Integer> aggregatedProductQuantities = product.getSizeQuantities().stream()
                    .collect(Collectors.toMap(
                            SizeQuantity::getSize,
                            SizeQuantity::getQuantity,
                            (q1, q2) -> {
                                logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", product.getProductId(), q1, q2);
                                return q1;
                            }));

            // Update product quantities by deducting return quantities
            for (Map.Entry<String, Integer> entry : returnQuantities.entrySet()) {
                String size = entry.getKey();
                int returnQty = entry.getValue();
                int currentQty = aggregatedProductQuantities.getOrDefault(size, 0);
                SizeQuantity sq = product.getSizeQuantities().stream()
                        .filter(s -> s.getSize().equals(size))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Size " + size + " not found in product inventory"));
                if (currentQty < returnQty) {
                    throw new IllegalArgumentException("Insufficient quantity in product for size: " + size);
                }
                sq.setQuantity(currentQty - returnQty);
            }

            // Update product inStock status
            int totalQuantity = product.getSizeQuantities().stream()
                    .mapToInt(SizeQuantity::getQuantity)
                    .sum();
            product.setInStock(totalQuantity > 0);
            productRepository.save(product);
        } else {
            throw new IllegalArgumentException("Invalid return condition: " + condition);
        }
    }

    @Transactional
    public List<ReturnDTO> getAllReturns() {
        try {
            List<Return> returns = returnRepository.findAllWithSizeQuantities();
            return returns.stream().map(returnEntity -> {
                ReturnDTO dto = new ReturnDTO();
                dto.setId(returnEntity.getId());
                dto.setProductId(returnEntity.getProductId());
                dto.setSaleId(returnEntity.getSaleId());
                dto.setReturnDate(returnEntity.getReturnDate());
                dto.setReason(returnEntity.getReason());
                dto.setSizeQuantities(returnEntity.getSizeQuantities());

                try {
                    Product product = productRepository.findAllWithSubcategoriesAndSizes().stream()
                            .filter(p -> p.getProductId() != null && p.getProductId().equals(returnEntity.getProductId()))
                            .findFirst()
                            .orElse(null);
                    dto.setProductName(product != null && product.getName() != null ? product.getName() : "Product Not Found");
                } catch (Exception e) {
                    logger.warn("Product fetch failed for return with productId {}: {}", returnEntity.getProductId(), e.getMessage());
                    dto.setProductName("Product Not Found");
                }

                return dto;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching returns: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch returns: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Integer> getProductSizes(String productId) {
        try {
            Product product = productRepository.findAllWithSubcategoriesAndSizes().stream()
                    .filter(p -> p.getProductId().equals(productId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
            return product.getSizeQuantities().stream()
                    .collect(Collectors.toMap(
                            SizeQuantity::getSize,
                            SizeQuantity::getQuantity,
                            (q1, q2) -> {
                                logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", productId, q1, q2);
                                return q1;
                            }));
        } catch (Exception e) {
            logger.error("Error fetching product sizes for productId {}: {}", productId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch product sizes: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Integer> getSaleSizes(Long saleId) {
        try {
            Sale sale = salesRepository.findById(saleId)
                    .orElseThrow(() -> new IllegalArgumentException("Sale not found with ID: " + saleId));
            return sale.getSizeQuantities().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        } catch (Exception e) {
            logger.error("Error fetching sale sizes for saleId {}: {}", saleId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch sale sizes: " + e.getMessage(), e);
        }
    }
}