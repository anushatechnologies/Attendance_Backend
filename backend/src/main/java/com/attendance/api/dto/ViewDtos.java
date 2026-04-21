package com.attendance.api.dto;

public class ViewDtos {
  public static class CompanyRoleView {
    private Long id;
    private String name;
    private String photoUrl;

    public CompanyRoleView(Long id, String name, String photoUrl) {
      this.id = id;
      this.name = name;
      this.photoUrl = photoUrl;
    }

    public Long getId() {
      return id;
    }

    public String getName() {
      return name;
    }

    public String getPhotoUrl() {
      return photoUrl;
    }
  }

  public static class EmployeeView {
    private Long id;
    private String employeeNumber;
    private String name;
    private String loginRole;
    private CompanyRoleView companyRole;

    public EmployeeView(
        Long id,
        String employeeNumber,
        String name,
        String loginRole,
        CompanyRoleView companyRole) {
      this.id = id;
      this.employeeNumber = employeeNumber;
      this.name = name;
      this.loginRole = loginRole;
      this.companyRole = companyRole;
    }

    public Long getId() {
      return id;
    }

    public String getEmployeeNumber() {
      return employeeNumber;
    }

    public String getName() {
      return name;
    }

    public String getLoginRole() {
      return loginRole;
    }

    public CompanyRoleView getCompanyRole() {
      return companyRole;
    }
  }

  public static class EmployeeProfileView {
    private Long employeeId;
    private String employeeNumber;
    private String name;
    private CompanyRoleView companyRole;

    public EmployeeProfileView(
        Long employeeId, String employeeNumber, String name, CompanyRoleView companyRole) {
      this.employeeId = employeeId;
      this.employeeNumber = employeeNumber;
      this.name = name;
      this.companyRole = companyRole;
    }

    public Long getEmployeeId() {
      return employeeId;
    }

    public String getEmployeeNumber() {
      return employeeNumber;
    }

    public String getName() {
      return name;
    }

    public CompanyRoleView getCompanyRole() {
      return companyRole;
    }
  }
}
