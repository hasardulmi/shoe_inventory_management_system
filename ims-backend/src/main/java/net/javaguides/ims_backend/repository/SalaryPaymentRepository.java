package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.SalaryPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryPaymentRepository extends JpaRepository<SalaryPayment, Long> {
    List<SalaryPayment> findByEmployeeId(Long employeeId);
}