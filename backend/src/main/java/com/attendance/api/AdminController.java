package com.attendance.api;

import com.attendance.api.dto.AdminDtos;
import com.attendance.api.dto.SettingsDtos;
import com.attendance.api.dto.ViewDtos;
import com.attendance.domain.Employee;
import com.attendance.repo.EmployeeRepository;
import com.attendance.service.CompanyProfileService;
import com.attendance.service.CompanyRoleService;
import com.attendance.service.AttendanceSettingsService;
import com.attendance.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {
  private final UserService userService;
  private final CompanyRoleService companyRoleService;
  private final AttendanceSettingsService attendanceSettingsService;
  private final CompanyProfileService companyProfileService;
  private final EmployeeRepository employeeRepository;

  public AdminController(
      UserService userService,
      CompanyRoleService companyRoleService,
      AttendanceSettingsService attendanceSettingsService,
      CompanyProfileService companyProfileService,
      EmployeeRepository employeeRepository) {
    this.userService = userService;
    this.companyRoleService = companyRoleService;
    this.attendanceSettingsService = attendanceSettingsService;
    this.companyProfileService = companyProfileService;
    this.employeeRepository = employeeRepository;
  }

  @PostMapping("/hr")
  public Object createHr(@Valid @RequestBody AdminDtos.CreateHrRequest req) {
    var hr = userService.createHr(req.getUsername(), req.getPassword());
    return java.util.Map.of("id", hr.getId(), "username", hr.getUsername(), "role", hr.getRole());
  }

  @PostMapping("/company-roles")
  public ViewDtos.CompanyRoleView createCompanyRole(
      @Valid @RequestBody AdminDtos.CreateCompanyRoleRequest req) {
    var r = companyRoleService.createRole(req.getName());
    return new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl());
  }

  @GetMapping("/company-roles")
  public List<ViewDtos.CompanyRoleView> listCompanyRoles() {
    return companyRoleService.listRoles().stream()
        .map(r -> new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl()))
        .toList();
  }

  @PostMapping("/company-roles/{id}/photo")
  public ViewDtos.CompanyRoleView uploadCompanyRolePhoto(
      @PathVariable("id") Long id, @RequestParam("file") MultipartFile file) {
    var r = companyRoleService.uploadRolePhoto(id, file);
    return new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl());
  }

  @PostMapping("/company/photo")
  public java.util.Map<String, Object> uploadCompanyGroupPhoto(@RequestParam("file") MultipartFile file) {
    var p = companyProfileService.uploadGroupPhoto(file);
    return java.util.Map.of("groupPhotoUrl", p.getGroupPhotoUrl());
  }

  @PostMapping("/employees")
  public ViewDtos.EmployeeView createEmployee(@Valid @RequestBody AdminDtos.CreateEmployeeRequest req) {
    var e =
        userService.createEmployee(
            req.getEmployeeNumber(),
            req.getName(),
            req.getUsername(),
            req.getPassword(),
            req.getCompanyRoleId(),
            req.getJoinDate());
    return toEmployeeView(e);
  }

  @GetMapping("/employees")
  public List<ViewDtos.EmployeeView> listEmployees() {
    return employeeRepository.findAll().stream().map(this::toEmployeeView).toList();
  }

  @GetMapping("/settings/attendance")
  public SettingsDtos.AttendanceSettingsResponse getAttendanceSettings() {
    var s = attendanceSettingsService.get();
    return new SettingsDtos.AttendanceSettingsResponse(
        s.getDefaultInTime(),
        s.getDefaultOutTime(),
        s.getWeekendDays(),
        s.getFullDayMinutes(),
        s.getHalfDayMinutes());
  }

  @PostMapping("/settings/attendance")
  public SettingsDtos.AttendanceSettingsResponse updateAttendanceSettings(
      @Valid @RequestBody SettingsDtos.UpdateAttendanceSettingsRequest req) {
    var s =
        attendanceSettingsService.update(
            req.getDefaultInTime(),
            req.getDefaultOutTime(),
            req.getWeekendDays(),
            req.getFullDayMinutes(),
            req.getHalfDayMinutes());
    return new SettingsDtos.AttendanceSettingsResponse(
        s.getDefaultInTime(),
        s.getDefaultOutTime(),
        s.getWeekendDays(),
        s.getFullDayMinutes(),
        s.getHalfDayMinutes());
  }

  private ViewDtos.EmployeeView toEmployeeView(Employee e) {
    var r = e.getCompanyRole();
    ViewDtos.CompanyRoleView rv =
        r == null ? null : new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl());
    return new ViewDtos.EmployeeView(
        e.getId(), e.getEmployeeNumber(), e.getName(), "ROLE_EMPLOYEE", rv);
  }
}
