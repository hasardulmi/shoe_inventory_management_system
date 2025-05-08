package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.ReturnDTO;
import net.javaguides.ims_backend.service.ReturnService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnController {

    private static final Logger logger = LoggerFactory.getLogger(ReturnController.class);

    @Autowired
    private ReturnService returnService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReturns() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<ReturnDTO> returns = returnService.getAllReturns();
            response.put("data", returns);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching all returns: {}", e.getMessage(), e);
            response.put("data", List.of());
            response.put("success", false);
            response.put("error", "Failed to fetch returns: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createReturn(@RequestBody ReturnDTO returnDTO) {
        try {
            ReturnDTO savedReturn = returnService.createReturn(returnDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("return", savedReturn);
            logger.info("Successfully created return with ID {}: {}", savedReturn.getId(), response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating return: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/product-sizes/{productId}")
    public ResponseEntity<?> getProductSizes(@PathVariable String productId) {
        try {
            Map<String, Integer> sizes = returnService.getProductSizes(productId);
            return ResponseEntity.ok(sizes);
        } catch (Exception e) {
            logger.error("Error fetching product sizes for productId {}: {}", productId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/sale-sizes/{saleId}")
    public ResponseEntity<?> getSaleSizes(@PathVariable Long saleId) {
        try {
            Map<String, Integer> sizes = returnService.getSaleSizes(saleId);
            return ResponseEntity.ok(sizes);
        } catch (Exception e) {
            logger.error("Error fetching sale sizes for saleId {}: {}", saleId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}