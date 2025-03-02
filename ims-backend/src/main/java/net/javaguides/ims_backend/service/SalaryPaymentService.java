package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.SalaryPaymentDto;
import net.javaguides.ims_backend.entity.Employee;
import net.javaguides.ims_backend.entity.SalaryPayment;
import net.javaguides.ims_backend.repository.EmployeeRepository;
import net.javaguides.ims_backend.repository.SalaryPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaryPaymentService {

    @Autowired
    private SalaryPaymentRepository salaryPaymentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<SalaryPaymentDto> getSalaryPaymentsByEmployeeId(Long employeeId) {
        return salaryPaymentRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SalaryPaymentDto createSalaryPayment(SalaryPaymentDto salaryPaymentDTO) {
        SalaryPayment salaryPayment = convertToEntity(salaryPaymentDTO);
        SalaryPayment savedPayment = salaryPaymentRepository.save(salaryPayment);
        return convertToDTO(savedPayment);
    }

    public SalaryPaymentDto updateSalaryPayment(Long id, SalaryPaymentDto salaryPaymentDTO) {
        SalaryPayment salaryPayment = salaryPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary payment not found"));
        salaryPayment.setPaymentDate(salaryPaymentDTO.getPaymentDate());
        salaryPayment.setAmount(salaryPaymentDTO.getAmount());
        salaryPayment.setPaid(salaryPaymentDTO.isPaid());
        SalaryPayment updatedPayment = salaryPaymentRepository.save(salaryPayment);
        return convertToDTO(updatedPayment);
    }

    private SalaryPaymentDto convertToDTO(SalaryPayment salaryPayment) {
        SalaryPaymentDto dto = new SalaryPaymentDto();
        dto.setId(salaryPayment.getId());
        dto.setEmployeeId(salaryPayment.getEmployee().getId());
        dto.setPaymentDate(salaryPayment.getPaymentDate());
        dto.setAmount(salaryPayment.getAmount());
        dto.setPaid(salaryPayment.isPaid());
        return dto;
    }

    private SalaryPayment convertToEntity(SalaryPaymentDto dto) {
        SalaryPayment salaryPayment = new SalaryPayment();
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        salaryPayment.setEmployee(employee);
        salaryPayment.setPaymentDate(dto.getPaymentDate());
        salaryPayment.setAmount(dto.getAmount());
        salaryPayment.setPaid(dto.isPaid());
        return salaryPayment;
    }
}