// src/main/java/net/javaguides/ims_backend/controller/ReturnController.java
package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.ErrorResponse;
import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.service.ReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnController {

    @Autowired
    private ReturnService returnService;

    @GetMapping
    public ResponseEntity<List<Return>> getAllReturns() {
        try {
            List<Return> returns = returnService.getAllReturns();
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> createReturn(@RequestBody Return returnEntity) {
        try {
            Return savedReturn = returnService.createReturn(returnEntity);
            return ResponseEntity.ok(savedReturn);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Validation error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to save return: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Return> updateReturn(@PathVariable Long id, @RequestBody Return returnDetails) {
        Optional<Return> updatedReturn = returnService.updateReturn(id, returnDetails);
        return updatedReturn.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}