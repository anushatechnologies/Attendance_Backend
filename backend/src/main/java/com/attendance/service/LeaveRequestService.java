package com.attendance.service;

import com.attendance.domain.AppUser;
import com.attendance.domain.Employee;
import com.attendance.domain.LeaveRequest;
import com.attendance.domain.LeaveRequestStatus;
import com.attendance.repo.LeaveRequestRepository;
import com.attendance.repo.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LeaveRequestService {
  private static final long MAX_RANGE_DAYS = 31;

  private final LeaveRequestRepository leaveRequestRepository;
  private final AttendanceService attendanceService;
  private final UserRepository userRepository;
  private final MailService mailService;

  public LeaveRequestService(
      LeaveRequestRepository leaveRequestRepository,
      AttendanceService attendanceService,
      UserRepository userRepository,
      MailService mailService) {
    this.leaveRequestRepository = leaveRequestRepository;
    this.attendanceService = attendanceService;
    this.userRepository = userRepository;
    this.mailService = mailService;
  }

  public List<LeaveRequest> listForEmployee(Employee employee) {
    return leaveRequestRepository.findAllByEmployee_IdOrderByCreatedAtDesc(employee.getId());
  }

  public List<LeaveRequest> listPending() {
    return leaveRequestRepository.findAllByStatusOrderByCreatedAtDesc(LeaveRequestStatus.PENDING);
  }

  @Transactional
  public LeaveRequest create(Employee employee, LocalDate fromDate, LocalDate toDate, String reason) {
    validateDates(fromDate, toDate);
    String normalizedReason = reason == null ? "" : reason.trim();
    if (normalizedReason.isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Reason is required");
    }

    boolean overlaps =
        leaveRequestRepository.existsByEmployee_IdAndStatusInAndFromDateLessThanEqualAndToDateGreaterThanEqual(
            employee.getId(),
            List.of(LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED),
            toDate,
            fromDate);
    if (overlaps) {
      throw new ApiException(
          HttpStatus.CONFLICT, "You already have a pending/approved leave request overlapping these dates");
    }

    LeaveRequest lr = new LeaveRequest();
    lr.setEmployee(employee);
    lr.setFromDate(fromDate);
    lr.setToDate(toDate);
    lr.setReason(normalizedReason);
    lr.setStatus(LeaveRequestStatus.PENDING);
    lr.setCreatedAt(Instant.now());
    LeaveRequest saved = leaveRequestRepository.save(lr);

    mailService.notifyHr(
        "Leave request: " + employee.getName() + " (" + employee.getEmployeeNumber() + ")",
        "Employee: "
            + employee.getName()
            + " ("
            + employee.getEmployeeNumber()
            + ")\n"
            + "Dates: "
            + fromDate
            + " -> "
            + toDate
            + "\n"
            + "Reason: "
            + normalizedReason
            + "\n\n"
            + "Login to the HR dashboard to approve/reject.");

    return saved;
  }

  @Transactional
  public LeaveRequest approve(Long leaveRequestId, String hrUsername, String remarks) {
    LeaveRequest lr =
        leaveRequestRepository
            .findById(leaveRequestId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave request not found"));
    if (lr.getStatus() != LeaveRequestStatus.PENDING) {
      throw new ApiException(HttpStatus.CONFLICT, "Leave request is not pending");
    }
    AppUser hr =
        userRepository
            .findByUsername(hrUsername)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));

    lr.setStatus(LeaveRequestStatus.APPROVED);
    lr.setDecidedAt(Instant.now());
    lr.setDecidedBy(hr);
    lr.setHrRemarks(normalizeRemarks(remarks));
    LeaveRequest saved = leaveRequestRepository.save(lr);

    // Mark leave in attendance for working days only.
    Employee emp = saved.getEmployee();
    for (LocalDate d = saved.getFromDate(); !d.isAfter(saved.getToDate()); d = d.plusDays(1)) {
      if (!attendanceService.isWorkingDay(d)) continue;
      attendanceService.upsert(emp.getId(), d, null, null, saved.getReason(), true);
    }

    String employeeEmail = emp.getUser().getUsername();
    mailService.notifyUser(
        employeeEmail,
        "Leave approved: " + saved.getFromDate() + " -> " + saved.getToDate(),
        "Your leave request has been APPROVED.\n"
            + "Dates: "
            + saved.getFromDate()
            + " -> "
            + saved.getToDate()
            + "\n"
            + "Reason: "
            + saved.getReason()
            + (saved.getHrRemarks() != null ? ("\nHR remarks: " + saved.getHrRemarks()) : "")
            + "\n");

    return saved;
  }

  @Transactional
  public LeaveRequest reject(Long leaveRequestId, String hrUsername, String remarks) {
    LeaveRequest lr =
        leaveRequestRepository
            .findById(leaveRequestId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave request not found"));
    if (lr.getStatus() != LeaveRequestStatus.PENDING) {
      throw new ApiException(HttpStatus.CONFLICT, "Leave request is not pending");
    }
    AppUser hr =
        userRepository
            .findByUsername(hrUsername)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));

    lr.setStatus(LeaveRequestStatus.REJECTED);
    lr.setDecidedAt(Instant.now());
    lr.setDecidedBy(hr);
    lr.setHrRemarks(normalizeRemarks(remarks));
    LeaveRequest saved = leaveRequestRepository.save(lr);

    Employee emp = saved.getEmployee();
    String employeeEmail = emp.getUser().getUsername();
    mailService.notifyUser(
        employeeEmail,
        "Leave rejected: " + saved.getFromDate() + " -> " + saved.getToDate(),
        "Your leave request has been REJECTED.\n"
            + "Dates: "
            + saved.getFromDate()
            + " -> "
            + saved.getToDate()
            + "\n"
            + "Reason: "
            + saved.getReason()
            + (saved.getHrRemarks() != null ? ("\nHR remarks: " + saved.getHrRemarks()) : "")
            + "\n");

    return saved;
  }

  private static void validateDates(LocalDate fromDate, LocalDate toDate) {
    if (fromDate == null || toDate == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "fromDate and toDate are required");
    }
    if (fromDate.isAfter(toDate)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "fromDate must be <= toDate");
    }
    long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
    if (days > MAX_RANGE_DAYS) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Range too large (max " + MAX_RANGE_DAYS + " days)");
    }
  }

  private static String normalizeRemarks(String remarks) {
    String r = remarks == null ? "" : remarks.trim();
    return r.isBlank() ? null : r;
  }
}
