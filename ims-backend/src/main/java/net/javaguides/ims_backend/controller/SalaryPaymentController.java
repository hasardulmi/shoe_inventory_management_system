package net.javaguides.ims_backend.controller;

import net.javaguides.ims_backend.dto.SalaryPaymentDto;
import net.javaguides.ims_backend.service.SalaryPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-payments")
public class SalaryPaymentController {

    @Autowired
    private SalaryPaymentService salaryPaymentService;

    @GetMapping("/employee/{employeeId}")
    public List<SalaryPaymentDto> getSalaryPaymentsByEmployeeId(@PathVariable Long employeeId) {
        return salaryPaymentService.getSalaryPaymentsByEmployeeId(employeeId);
    }

    @PostMapping
    public SalaryPaymentDto createSalaryPayment(@RequestBody SalaryPaymentDto salaryPaymentDTO) {
        return salaryPaymentService.createSalaryPayment(salaryPaymentDTO);
    }

    @PutMapping("/{id}")
    public SalaryPaymentDto updateSalaryPayment(@PathVariable Long id, @RequestBody SalaryPaymentDto salaryPaymentDTO) {
        return salaryPaymentService.updateSalaryPayment(id, salaryPaymentDTO);
    }
}