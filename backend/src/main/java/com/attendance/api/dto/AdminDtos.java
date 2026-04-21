package com.attendance.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AdminDtos {
  public static class CreateHrRequest {
    @NotBlank private String username;
    @NotBlank private String password;

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }
  }

  public static class CreateCompanyRoleRequest {
    @NotBlank private String name;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }
  }

  public static class CreateEmployeeRequest {
    @NotBlank private String employeeNumber;
    @NotBlank private String name;
    @NotBlank private String username;
    @NotBlank private String password;
    @NotNull private Long companyRoleId;
    private LocalDate joinDate;

    public String getEmployeeNumber() {
      return employeeNumber;
    }

    public void setEmployeeNumber(String employeeNumber) {
      this.employeeNumber = employeeNumber;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getPassword() {
      return password;
    }

    public void setPassword(String password) {
      this.password = password;
    }

    public Long getCompanyRoleId() {
      return companyRoleId;
    }

    public void setCompanyRoleId(Long companyRoleId) {
      this.companyRoleId = companyRoleId;
    }

    public LocalDate getJoinDate() {
      return joinDate;
    }

    public void setJoinDate(LocalDate joinDate) {
      this.joinDate = joinDate;
    }
  }
}
