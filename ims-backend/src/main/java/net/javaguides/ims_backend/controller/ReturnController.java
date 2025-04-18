package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.service.ReturnService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnController {

    private static final Logger logger = LoggerFactory.getLogger(ReturnController.class);

    @Autowired
    private ReturnService returnService;

    @GetMapping
    public ResponseEntity<List<Return>> getAllReturns() {
        try {
            List<Return> returns = returnService.getAllReturns();
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            logger.error("Failed to fetch returns: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> createReturn(@RequestBody Return returnEntity) {
        try {
            logger.info("Received return payload: {}", returnEntity);
            Return savedReturn = returnService.createReturn(returnEntity);
            logger.info("Return saved successfully: {}", savedReturn);
            return ResponseEntity.status(201).body(savedReturn);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to save return: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to save return: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReturn(@PathVariable Long id, @RequestBody Return returnDetails) {
        try {
            Optional<Return> updatedReturn = returnService.updateReturn(id, returnDetails);
            if (!updatedReturn.isPresent()) {
                logger.warn("Return ID {} not found", id);
                return ResponseEntity.status(404).body("Return not found");
            }
            logger.info("Return ID {} updated successfully: {}", id, updatedReturn.get());
            return ResponseEntity.ok(updatedReturn.get());
        } catch (IllegalArgumentException e) {
            logger.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Validation error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to update return ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to update return: " + e.getMessage());
        }
    }
}