package net.javaguides.ims_backend.repository;

import net.javaguides.ims_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}