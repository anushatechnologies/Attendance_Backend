package com.attendance.api;

import com.attendance.api.dto.AttendanceDtos;
import com.attendance.api.dto.SummaryDtos;
import com.attendance.api.dto.ViewDtos;
import com.attendance.domain.AppUser;
import com.attendance.domain.Role;
import com.attendance.repo.EmployeeRepository;
import com.attendance.repo.UserRepository;
import com.attendance.service.ApiException;
import com.attendance.service.AttendanceService;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee")
@PreAuthorize("hasAuthority('ROLE_EMPLOYEE')")
public class EmployeeController {
  private final UserRepository userRepository;
  private final EmployeeRepository employeeRepository;
  private final AttendanceService attendanceService;

  public EmployeeController(
      UserRepository userRepository,
      EmployeeRepository employeeRepository,
      AttendanceService attendanceService) {
    this.userRepository = userRepository;
    this.employeeRepository = employeeRepository;
    this.attendanceService = attendanceService;
  }

  @GetMapping("/profile")
  public ViewDtos.EmployeeProfileView profile() {
    var emp = currentEmployee();
    var r = emp.getCompanyRole();
    ViewDtos.CompanyRoleView rv =
        r == null ? null : new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl());
    return new ViewDtos.EmployeeProfileView(
        emp.getId(), emp.getEmployeeNumber(), emp.getName(), rv);
  }

  @GetMapping("/attendance")
  public List<AttendanceDtos.AttendanceResponse> listForMonth(@RequestParam("month") String month) {
    var emp = currentEmployee();
    YearMonth ym = YearMonth.parse(month);
    return attendanceService.listForMonth(emp.getId(), ym).stream()
        .map(
            e ->
                new AttendanceDtos.AttendanceResponse(
                    e.getId(),
                    e.getEmployee().getId(),
                    e.getDate(),
                    e.getInTime(),
                    e.getOutTime(),
                    e.getWorkedMinutes(),
                    e.getLeaveReason(),
                    e.getStatus()))
        .toList();
  }

  @GetMapping("/attendance/summary")
  public SummaryDtos.MonthSummaryResponse summary(@RequestParam("month") String month) {
    var emp = currentEmployee();
    YearMonth ym = YearMonth.parse(month);
    var s = attendanceService.monthSummary(emp.getId(), ym);
    return new SummaryDtos.MonthSummaryResponse(
        ym.toString(),
        s.fromDate(),
        s.toDate(),
        s.workingDays(),
        s.presentDays(),
        s.halfDayDays(),
        s.leaveDays(),
        s.totalWorkedMinutes());
  }

  private com.attendance.domain.Employee currentEmployee() {
    String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    AppUser user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));
    if (user.getRole() != Role.ROLE_EMPLOYEE) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not an employee");
    }
    return employeeRepository
        .findByUser_Id(user.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Employee profile missing"));
  }
}
