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
                Sale fetchedSale = salesRepository.findById(returnDTO.getSaleId())
                        .orElseThrow(() -> new IllegalArgumentException("Sale not found with ID: " + returnDTO.getSaleId()));
                if (returnDTO.getProductId() != null && !returnDTO.getProductId().isEmpty() && !fetchedSale.getProductId().equals(returnDTO.getProductId())) {
                    throw new IllegalArgumentException("Sale does not match the provided Product ID");
                }
                sale = fetchedSale;
            }

            // Normalize return quantities to handle "N/A" for sales without sizes
            Map<String, Integer> normalizedReturnQuantities = new HashMap<>();
            boolean saleHasSizes = sale != null && sale.getSizeQuantities() != null && !sale.getSizeQuantities().isEmpty();
            for (Map.Entry<String, Integer> entry : returnDTO.getSizeQuantities().entrySet()) {
                String size = entry.getKey();
                Integer qty = entry.getValue();
                if (!saleHasSizes) {
                    // If sale has no sizes, aggregate all quantities under "N/A"
                    size = "N/A";
                    normalizedReturnQuantities.merge("N/A", qty, Integer::sum);
                } else {
                    normalizedReturnQuantities.put(size, qty);
                }
            }

            // Validate return quantities against available quantities
            Map<String, Integer> availableQuantities = new HashMap<>();
            if (sale != null && ("ADD_PRODUCT_QUANTITY".equals(condition) || "DEDUCT_SALE_QUANTITY".equals(condition))) {
                if (sale.getSizeQuantities() != null && !sale.getSizeQuantities().isEmpty()) {
                    availableQuantities.putAll(sale.getSizeQuantities());
                } else if (sale.getQuantity() != null && sale.getQuantity() >= 0) {
                    availableQuantities.put("N/A", sale.getQuantity());
                } else {
                    logger.warn("Sale ID {} has no sizeQuantities and quantity is null or negative: {}", returnDTO.getSaleId(), sale.getQuantity());
                    availableQuantities.put("N/A", 0);
                }
                logger.debug("Available quantities for sale ID {}: {}", returnDTO.getSaleId(), availableQuantities);
            } else if (product != null && "DEDUCT_PRODUCT_QUANTITY".equals(condition)) {
                if (product.getHasSizes() != null && product.getHasSizes() && product.getSizeQuantities() != null) {
                    product.getSizeQuantities().forEach(sq -> {
                        availableQuantities.put(sq.getSize(), sq.getQuantity());
                    });
                } else {
                    availableQuantities.put("N/A", product.getQuantity() != null ? product.getQuantity() : 0);
                }
                logger.debug("Available quantities for product ID {}: {}", product.getProductId(), availableQuantities);
            } else {
                throw new IllegalArgumentException("Cannot determine available quantities for the given condition");
            }

            // Validate normalized return quantities
            for (Map.Entry<String, Integer> entry : normalizedReturnQuantities.entrySet()) {
                String size = entry.getKey();
                Integer qty = entry.getValue();
                Integer availableQty = availableQuantities.getOrDefault(size, 0);
                if (qty == null || qty <= 0) {
                    throw new IllegalArgumentException("Return quantity for size " + size + " must be a positive number");
                }
                if (qty > availableQty) {
                    throw new IllegalArgumentException("Return quantity (" + qty + ") for size " + size + " exceeds available quantity (" + availableQty + ")");
                }
            }

            Return returnEntity = new Return();
            returnEntity.setProductId(returnDTO.getProductId());
            returnEntity.setSaleId(returnDTO.getSaleId());
            returnEntity.setReturnDate(returnDTO.getReturnDate());
            returnEntity.setReason(returnDTO.getReason());
            returnEntity.setSizeQuantities(normalizedReturnQuantities); // Use normalized quantities

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

        // Normalize return quantities for consistency
        Map<String, Integer> normalizedReturnQuantities = new HashMap<>();
        boolean saleHasSizes = sale != null && sale.getSizeQuantities() != null && !sale.getSizeQuantities().isEmpty();
        for (Map.Entry<String, Integer> entry : returnQuantities.entrySet()) {
            String size = entry.getKey();
            Integer qty = entry.getValue();
            if (!saleHasSizes) {
                size = "N/A";
                normalizedReturnQuantities.merge("N/A", qty, Integer::sum);
            } else {
                normalizedReturnQuantities.put(size, qty);
            }
        }

        if ("ADD_PRODUCT_QUANTITY".equals(condition)) {
            if (product == null || sale == null) {
                throw new IllegalStateException("Product and Sale must be provided for 'Add Product Quantity' condition");
            }

            // Check if the product has sizes
            boolean productHasSizes = product.getHasSizes() != null && product.getHasSizes();
            if (productHasSizes) {
                // Handle products with sizes
                Map<String, Integer> aggregatedProductQuantities = product.getSizeQuantities().stream()
                        .collect(Collectors.toMap(
                                SizeQuantity::getSize,
                                SizeQuantity::getQuantity,
                                (q1, q2) -> {
                                    logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", product.getProductId(), q1, q2);
                                    return q1;
                                }));

                // Update product quantities by adding return quantities
                for (Map.Entry<String, Integer> entry : normalizedReturnQuantities.entrySet()) {
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
            } else {
                // Handle products without sizes
                int totalReturnQty = normalizedReturnQuantities.getOrDefault("N/A", 0);
                int currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
                product.setQuantity(currentQty + totalReturnQty);
            }

            // Re-fetch sale to ensure we have the latest quantity
            Sale fetchedSale = salesRepository.findById(sale.getId())
                    .orElseThrow(() -> new IllegalStateException("Sale not found with ID: " + sale.getId()));

            // Update sale quantities (deduct returned quantities)
            if (fetchedSale.getSizeQuantities() != null && !fetchedSale.getSizeQuantities().isEmpty()) {
                Map<String, Integer> saleSizeQuantities = fetchedSale.getSizeQuantities();
                Map<String, Integer> updatedSaleQuantities = new HashMap<>(saleSizeQuantities);
                for (Map.Entry<String, Integer> entry : normalizedReturnQuantities.entrySet()) {
                    String size = entry.getKey();
                    int qty = entry.getValue();
                    int currentQty = saleSizeQuantities.getOrDefault(size, 0);
                    if (currentQty < qty) {
                        throw new IllegalArgumentException("Insufficient quantity in sale for size: " + size);
                    }
                    updatedSaleQuantities.put(size, currentQty - qty);
                }
                fetchedSale.setSizeQuantities(updatedSaleQuantities);
            } else if (fetchedSale.getQuantity() != null) {
                int totalReturnQty = normalizedReturnQuantities.getOrDefault("N/A", 0);
                int currentQty = fetchedSale.getQuantity();
                logger.debug("Before deduction - Sale ID {} quantity: {}, return quantity: {}", fetchedSale.getId(), currentQty, totalReturnQty);
                if (currentQty < totalReturnQty) {
                    throw new IllegalArgumentException("Insufficient quantity in sale for size: N/A");
                }
                fetchedSale.setQuantity(currentQty - totalReturnQty);
                logger.debug("After deduction - Sale ID {} quantity: {}", fetchedSale.getId(), fetchedSale.getQuantity());
            }
            salesRepository.save(fetchedSale);

            // Update product inStock status
            int totalQuantity;
            if (productHasSizes) {
                totalQuantity = product.getSizeQuantities().stream()
                        .mapToInt(SizeQuantity::getQuantity)
                        .sum();
            } else {
                totalQuantity = product.getQuantity() != null ? product.getQuantity() : 0;
            }
            product.setInStock(totalQuantity > 0);
            productRepository.save(product);
        } else if ("DEDUCT_SALE_QUANTITY".equals(condition)) {
            if (sale == null) {
                throw new IllegalStateException("Sale must be provided for 'Deduct Sale Quantity' condition");
            }

            // Re-fetch sale to ensure we have the latest quantity
            Sale fetchedSale = salesRepository.findById(sale.getId())
                    .orElseThrow(() -> new IllegalStateException("Sale not found with ID: " + sale.getId()));

            if (fetchedSale.getSizeQuantities() != null && !fetchedSale.getSizeQuantities().isEmpty()) {
                Map<String, Integer> saleSizeQuantities = fetchedSale.getSizeQuantities();
                Map<String, Integer> updatedSaleQuantities = new HashMap<>(saleSizeQuantities);
                for (Map.Entry<String, Integer> entry : normalizedReturnQuantities.entrySet()) {
                    String size = entry.getKey();
                    int qty = entry.getValue();
                    int currentQty = saleSizeQuantities.getOrDefault(size, 0);
                    if (currentQty < qty) {
                        throw new IllegalArgumentException("Insufficient quantity in sale for size: " + size);
                    }
                    updatedSaleQuantities.put(size, currentQty - qty);
                }
                fetchedSale.setSizeQuantities(updatedSaleQuantities);
            } else if (fetchedSale.getQuantity() != null) {
                int totalReturnQty = normalizedReturnQuantities.getOrDefault("N/A", 0);
                int currentQty = fetchedSale.getQuantity();
                logger.debug("Before deduction - Sale ID {} quantity: {}, return quantity: {}", fetchedSale.getId(), currentQty, totalReturnQty);
                if (currentQty < totalReturnQty) {
                    throw new IllegalArgumentException("Insufficient quantity in sale for size: N/A");
                }
                fetchedSale.setQuantity(currentQty - totalReturnQty);
                logger.debug("After deduction - Sale ID {} quantity: {}", fetchedSale.getId(), fetchedSale.getQuantity());
            }
            salesRepository.save(fetchedSale);
        } else if ("DEDUCT_PRODUCT_QUANTITY".equals(condition)) {
            if (product == null) {
                throw new IllegalStateException("Product must be provided for 'Deduct Product Quantity' condition");
            }

            // Check if the product has sizes
            boolean productHasSizes = product.getHasSizes() != null && product.getHasSizes();
            if (productHasSizes) {
                // Handle products with sizes
                Map<String, Integer> aggregatedProductQuantities = product.getSizeQuantities().stream()
                        .collect(Collectors.toMap(
                                SizeQuantity::getSize,
                                SizeQuantity::getQuantity,
                                (q1, q2) -> {
                                    logger.warn("Duplicate size detected in product {}: size={}, quantities={} and {}", product.getProductId(), q1, q2);
                                    return q1;
                                }));

                // Update product quantities by deducting return quantities
                for (Map.Entry<String, Integer> entry : normalizedReturnQuantities.entrySet()) {
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
            } else {
                // Handle products without sizes
                int totalReturnQty = normalizedReturnQuantities.getOrDefault("N/A", 0);
                int currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
                if (currentQty < totalReturnQty) {
                    throw new IllegalArgumentException("Insufficient quantity in product for size: N/A");
                }
                product.setQuantity(currentQty - totalReturnQty);
            }

            // Update product inStock status
            int totalQuantity;
            if (productHasSizes) {
                totalQuantity = product.getSizeQuantities().stream()
                        .mapToInt(SizeQuantity::getQuantity)
                        .sum();
            } else {
                totalQuantity = product.getQuantity() != null ? product.getQuantity() : 0;
            }
            product.setInStock(totalQuantity > 0);
            productRepository.save(product);
        } else {
            throw new IllegalArgumentException("Invalid return condition: " + condition);
        }
    }

    private String getProductNameForReturn(String productId) {
        try {
            Product product = productRepository.findAllWithSubcategoriesAndSizes().stream()
                    .filter(p -> p.getProductId() != null && p.getProductId().equals(productId))
                    .findFirst()
                    .orElse(null);
            return product != null && product.getName() != null ? product.getName() : "Product Not Found";
        } catch (Exception e) {
            logger.warn("Product fetch failed for return with productId {}: {}", productId, e.getMessage());
            return "Product Not Found";
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
                dto.setProductName(getProductNameForReturn(returnEntity.getProductId()));
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
            Map<String, Integer> result = new HashMap<>();
            if (product.getHasSizes() != null && product.getHasSizes() && product.getSizeQuantities() != null) {
                product.getSizeQuantities().stream()
                        .filter(sq -> sq.getQuantity() > 0)
                        .forEach(sq -> result.put(sq.getSize(), sq.getQuantity()));
            } else {
                result.put("N/A", product.getQuantity() != null ? product.getQuantity() : 0);
            }
            return result;
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
            Map<String, Integer> result = new HashMap<>();
            if (sale.getSizeQuantities() != null && !sale.getSizeQuantities().isEmpty()) {
                sale.getSizeQuantities().entrySet().stream()
                        .filter(entry -> entry.getValue() > 0)
                        .forEach(entry -> result.put(entry.getKey(), entry.getValue()));
            } else if (sale.getQuantity() != null && sale.getQuantity() >= 0) {
                result.put("N/A", sale.getQuantity());
            } else {
                logger.warn("No valid quantities found for saleId: {}. Defaulting to 0 for N/A.", saleId);
                result.put("N/A", 0);
            }
            logger.debug("getSaleSizes for saleId {} returned: {}", saleId, result);
            return result;
        } catch (Exception e) {
            logger.error("Error fetching sale sizes for saleId {}: {}", saleId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch sale sizes: " + e.getMessage(), e);
        }
    }
}