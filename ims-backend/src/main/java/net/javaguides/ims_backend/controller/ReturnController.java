package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.entity.Return;
import net.javaguides.ims_backend.service.ReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "http://localhost:3000")
public class ReturnController {

    @Autowired
    private ReturnService returnService;

    @GetMapping
    public ResponseEntity<List<Return>> getAllReturns() {
        List<Return> returns = returnService.getAllReturns();
        return new ResponseEntity<>(returns, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createReturn(@RequestBody Return returnEntity) {
        try {
            Return createdReturn = returnService.createReturn(returnEntity);
            return new ResponseEntity<>(createdReturn, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{returnId}/mark-returned")
    public ResponseEntity<?> markReturnAsCompleted(@PathVariable Long returnId, @RequestBody Return returnEntity) {
        try {
            Return updatedReturn = returnService.markReturnAsCompleted(returnId, returnEntity.getReturnedDate());
            return new ResponseEntity<>(updatedReturn, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}