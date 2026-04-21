package com.attendance.repo;

import com.attendance.domain.Employee;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
  @Override
  @EntityGraph(attributePaths = {"companyRole"})
  java.util.List<Employee> findAll();

  @EntityGraph(attributePaths = {"companyRole"})
  Optional<Employee> findByUser_Id(Long userId);
  boolean existsByEmployeeNumber(String employeeNumber);
}
