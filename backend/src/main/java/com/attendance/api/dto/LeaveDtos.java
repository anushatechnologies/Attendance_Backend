package com.attendance.api.dto;

import com.attendance.domain.LeaveRequestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;

public class LeaveDtos {
  public static class CreateLeaveRequest {
    @NotNull private LocalDate fromDate;
    @NotNull private LocalDate toDate;
    @NotBlank private String reason;

    public LocalDate getFromDate() {
      return fromDate;
    }

    public void setFromDate(LocalDate fromDate) {
      this.fromDate = fromDate;
    }

    public LocalDate getToDate() {
      return toDate;
    }

    public void setToDate(LocalDate toDate) {
      this.toDate = toDate;
    }

    public String getReason() {
      return reason;
    }

    public void setReason(String reason) {
      this.reason = reason;
    }
  }

  public static class DecideLeaveRequest {
    private String remarks;

    public String getRemarks() {
      return remarks;
    }

    public void setRemarks(String remarks) {
      this.remarks = remarks;
    }
  }

  public static class LeaveRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeNumber;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reason;
    private LeaveRequestStatus status;
    private Instant createdAt;
    private Instant decidedAt;
    private String decidedBy;
    private String hrRemarks;

    public LeaveRequestResponse(
        Long id,
        Long employeeId,
        String employeeName,
        String employeeNumber,
        LocalDate fromDate,
        LocalDate toDate,
        String reason,
        LeaveRequestStatus status,
        Instant createdAt,
        Instant decidedAt,
        String decidedBy,
        String hrRemarks) {
      this.id = id;
      this.employeeId = employeeId;
      this.employeeName = employeeName;
      this.employeeNumber = employeeNumber;
      this.fromDate = fromDate;
      this.toDate = toDate;
      this.reason = reason;
      this.status = status;
      this.createdAt = createdAt;
      this.decidedAt = decidedAt;
      this.decidedBy = decidedBy;
      this.hrRemarks = hrRemarks;
    }

    public Long getId() {
      return id;
    }

    public Long getEmployeeId() {
      return employeeId;
    }

    public String getEmployeeName() {
      return employeeName;
    }

    public String getEmployeeNumber() {
      return employeeNumber;
    }

    public LocalDate getFromDate() {
      return fromDate;
    }

    public LocalDate getToDate() {
      return toDate;
    }

    public String getReason() {
      return reason;
    }

    public LeaveRequestStatus getStatus() {
      return status;
    }

    public Instant getCreatedAt() {
      return createdAt;
    }

    public Instant getDecidedAt() {
      return decidedAt;
    }

    public String getDecidedBy() {
      return decidedBy;
    }

    public String getHrRemarks() {
      return hrRemarks;
    }
  }
}

