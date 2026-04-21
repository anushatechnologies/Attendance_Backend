package com.attendance.service;

import com.attendance.domain.AppUser;
import com.attendance.domain.Employee;
import com.attendance.domain.CompanyRole;
import com.attendance.domain.Role;
import com.attendance.config.AppConfig;
import com.attendance.repo.EmployeeRepository;
import com.attendance.repo.CompanyRoleRepository;
import com.attendance.repo.UserRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final EmployeeRepository employeeRepository;
  private final CompanyRoleRepository companyRoleRepository;
  private final PasswordEncoder passwordEncoder;
  private final AppConfig appConfig;

  public UserService(
      UserRepository userRepository,
      EmployeeRepository employeeRepository,
      CompanyRoleRepository companyRoleRepository,
      PasswordEncoder passwordEncoder,
      AppConfig appConfig) {
    this.userRepository = userRepository;
    this.employeeRepository = employeeRepository;
    this.companyRoleRepository = companyRoleRepository;
    this.passwordEncoder = passwordEncoder;
    this.appConfig = appConfig;
  }

  public Optional<AppUser> findByUsername(String username) {
    return userRepository.findByUsername(username);
  }

  public Optional<Employee> findEmployeeByUserId(Long userId) {
    return employeeRepository.findByUser_Id(userId);
  }

  @Transactional
  public AppUser createHr(String username, String password) {
    if (userRepository.existsByUsername(username)) {
      throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
    }
    AppUser user = new AppUser();
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setRole(Role.ROLE_HR);
    return userRepository.save(user);
  }

  @Transactional
  public Employee createEmployee(
      String employeeNumber,
      String name,
      String username,
      String password,
      Long companyRoleId,
      LocalDate joinDate) {
    if (employeeRepository.existsByEmployeeNumber(employeeNumber)) {
      throw new ApiException(HttpStatus.CONFLICT, "Employee number already exists");
    }
    if (userRepository.existsByUsername(username)) {
      throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
    }
    CompanyRole companyRole =
        companyRoleRepository
            .findById(companyRoleId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company role not found"));

    AppUser user = new AppUser();
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setRole(Role.ROLE_EMPLOYEE);
    user = userRepository.save(user);

    Employee emp = new Employee();
    emp.setEmployeeNumber(employeeNumber);
    emp.setName(name);
    emp.setUser(user);
    emp.setCompanyRole(companyRole);
    emp.setJoinDate(joinDate != null ? joinDate : defaultJoinDate());
    return employeeRepository.save(emp);
  }

  private LocalDate defaultJoinDate() {
    String raw = appConfig.getAttendance().getDefaultJoinDate();
    if (raw == null || raw.isBlank()) return LocalDate.now();
    try {
      return LocalDate.parse(raw.trim());
    } catch (Exception ignored) {
      return LocalDate.now();
    }
  }
}
