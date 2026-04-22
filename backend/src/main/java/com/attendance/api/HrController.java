package com.attendance.api;

import com.attendance.api.dto.AttendanceDtos;
import com.attendance.api.dto.LeaveDtos;
import com.attendance.api.dto.SummaryDtos;
import com.attendance.api.dto.ViewDtos;
import com.attendance.domain.Employee;
import com.attendance.repo.EmployeeRepository;
import com.attendance.service.LeaveRequestService;
import com.attendance.service.ApiException;
import com.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr")
@PreAuthorize("hasAuthority('ROLE_HR')")
public class HrController {
  private final EmployeeRepository employeeRepository;
  private final AttendanceService attendanceService;
  private final LeaveRequestService leaveRequestService;

  public HrController(
      EmployeeRepository employeeRepository,
      AttendanceService attendanceService,
      LeaveRequestService leaveRequestService) {
    this.employeeRepository = employeeRepository;
    this.attendanceService = attendanceService;
    this.leaveRequestService = leaveRequestService;
  }

  @GetMapping("/employees")
  public List<ViewDtos.EmployeeView> listEmployees() {
    return employeeRepository.findAll().stream().map(this::toEmployeeView).toList();
  }

  @PostMapping("/attendance")
  public AttendanceDtos.AttendanceResponse upsert(@Valid @RequestBody AttendanceDtos.UpsertAttendanceRequest req) {
    var e =
        attendanceService.upsert(
            req.getEmployeeId(),
            req.getDate(),
            req.getInTime(),
            req.getOutTime(),
            req.getLeaveReason(),
            true);
    return new AttendanceDtos.AttendanceResponse(
        e.getId(),
        e.getEmployee().getId(),
        e.getDate(),
        e.getInTime(),
        e.getOutTime(),
        e.getWorkedMinutes(),
        e.getLeaveReason(),
        e.getCheckInLatitude(),
        e.getCheckInLongitude(),
        e.getCheckInPhotoUrl(),
        e.getCheckOutLatitude(),
        e.getCheckOutLongitude(),
        e.getCheckOutPhotoUrl(),
        e.getStatus());
  }

  @PostMapping("/attendance/range")
  public Map<String, Object> upsertRange(
      @Valid @RequestBody AttendanceDtos.UpsertAttendanceRangeRequest req) {
    var fromDate = req.getFromDate();
    var toDate = req.getToDate();
    var startDate = attendanceService.attendanceStartDate(req.getEmployeeId());
    if (fromDate.isBefore(startDate)) {
      fromDate = startDate;
    }

    if (fromDate.isAfter(toDate)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "fromDate must be <= toDate");
    }
    long days = java.time.temporal.ChronoUnit.DAYS.between(fromDate, toDate) + 1;
    if (days > 400) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Range too large (max 400 days)");
    }
    int updated = 0;
    for (var d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
      if (!attendanceService.isWorkingDay(d)) continue;
      attendanceService.upsert(
          req.getEmployeeId(), d, req.getInTime(), req.getOutTime(), req.getLeaveReason(), true);
      updated++;
    }
    return Map.of("updatedDays", updated);
  }

  @GetMapping("/attendance")
  public List<AttendanceDtos.AttendanceResponse> listForMonth(
      @RequestParam("employeeId") Long employeeId, @RequestParam("month") String month) {
    YearMonth ym = YearMonth.parse(month);
    return attendanceService.listForMonth(employeeId, ym).stream()
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
                    e.getCheckInLatitude(),
                    e.getCheckInLongitude(),
                    e.getCheckInPhotoUrl(),
                    e.getCheckOutLatitude(),
                    e.getCheckOutLongitude(),
                    e.getCheckOutPhotoUrl(),
                    e.getStatus()))
        .toList();
  }

  @GetMapping("/attendance/summary")
  public SummaryDtos.MonthSummaryResponse summary(
      @RequestParam("employeeId") Long employeeId, @RequestParam("month") String month) {
    YearMonth ym = YearMonth.parse(month);
    var s = attendanceService.monthSummary(employeeId, ym);
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

  @GetMapping("/leave-requests/pending")
  public List<LeaveDtos.LeaveRequestResponse> pendingLeaveRequests() {
    return leaveRequestService.listPending().stream().map(HrController::toLeaveResponse).toList();
  }

  @PostMapping("/leave-requests/{id}/approve")
  public LeaveDtos.LeaveRequestResponse approve(@PathVariable("id") Long id, @RequestBody(required = false) LeaveDtos.DecideLeaveRequest req) {
    String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    var saved = leaveRequestService.approve(id, username, req == null ? null : req.getRemarks());
    return toLeaveResponse(saved);
  }

  @PostMapping("/leave-requests/{id}/reject")
  public LeaveDtos.LeaveRequestResponse reject(@PathVariable("id") Long id, @RequestBody(required = false) LeaveDtos.DecideLeaveRequest req) {
    String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    var saved = leaveRequestService.reject(id, username, req == null ? null : req.getRemarks());
    return toLeaveResponse(saved);
  }

  private ViewDtos.EmployeeView toEmployeeView(Employee e) {
    var r = e.getCompanyRole();
    ViewDtos.CompanyRoleView rv =
        r == null ? null : new ViewDtos.CompanyRoleView(r.getId(), r.getName(), r.getPhotoUrl());
    return new ViewDtos.EmployeeView(
        e.getId(), e.getEmployeeNumber(), e.getName(), "ROLE_EMPLOYEE", rv);
  }

  private static LeaveDtos.LeaveRequestResponse toLeaveResponse(com.attendance.domain.LeaveRequest lr) {
    var e = lr.getEmployee();
    var decidedBy = lr.getDecidedBy() == null ? null : lr.getDecidedBy().getUsername();
    return new LeaveDtos.LeaveRequestResponse(
        lr.getId(),
        e.getId(),
        e.getName(),
        e.getEmployeeNumber(),
        lr.getFromDate(),
        lr.getToDate(),
        lr.getReason(),
        lr.getStatus(),
        lr.getCreatedAt(),
        lr.getDecidedAt(),
        decidedBy,
        lr.getHrRemarks());
  }
}
