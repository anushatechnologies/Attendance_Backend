package com.attendance.api.dto;

import com.attendance.domain.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceDtos {
  public static class UpsertAttendanceRequest {
    @NotNull private Long employeeId;
    @NotNull private LocalDate date;
    private LocalTime inTime;
    private LocalTime outTime;
    private String leaveReason;

    public Long getEmployeeId() {
      return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
      this.employeeId = employeeId;
    }

    public LocalDate getDate() {
      return date;
    }

    public void setDate(LocalDate date) {
      this.date = date;
    }

    public LocalTime getInTime() {
      return inTime;
    }

    public void setInTime(LocalTime inTime) {
      this.inTime = inTime;
    }

    public LocalTime getOutTime() {
      return outTime;
    }

    public void setOutTime(LocalTime outTime) {
      this.outTime = outTime;
    }

    public String getLeaveReason() {
      return leaveReason;
    }

    public void setLeaveReason(String leaveReason) {
      this.leaveReason = leaveReason;
    }
  }

  public static class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private LocalDate date;
    private LocalTime inTime;
    private LocalTime outTime;
    private Integer workedMinutes;
    private String leaveReason;
    private Double checkInLatitude;
    private Double checkInLongitude;
    private String checkInPhotoUrl;
    private Double checkOutLatitude;
    private Double checkOutLongitude;
    private String checkOutPhotoUrl;
    private AttendanceStatus status;

    public AttendanceResponse(
        Long id,
        Long employeeId,
        LocalDate date,
        LocalTime inTime,
        LocalTime outTime,
        Integer workedMinutes,
        String leaveReason,
        Double checkInLatitude,
        Double checkInLongitude,
        String checkInPhotoUrl,
        Double checkOutLatitude,
        Double checkOutLongitude,
        String checkOutPhotoUrl,
        AttendanceStatus status) {
      this.id = id;
      this.employeeId = employeeId;
      this.date = date;
      this.inTime = inTime;
      this.outTime = outTime;
      this.workedMinutes = workedMinutes;
      this.leaveReason = leaveReason;
      this.checkInLatitude = checkInLatitude;
      this.checkInLongitude = checkInLongitude;
      this.checkInPhotoUrl = checkInPhotoUrl;
      this.checkOutLatitude = checkOutLatitude;
      this.checkOutLongitude = checkOutLongitude;
      this.checkOutPhotoUrl = checkOutPhotoUrl;
      this.status = status;
    }

    public Long getId() {
      return id;
    }

    public Long getEmployeeId() {
      return employeeId;
    }

    public LocalDate getDate() {
      return date;
    }

    public LocalTime getInTime() {
      return inTime;
    }

    public LocalTime getOutTime() {
      return outTime;
    }

    public Integer getWorkedMinutes() {
      return workedMinutes;
    }

    public String getLeaveReason() {
      return leaveReason;
    }

    public Double getCheckInLatitude() {
      return checkInLatitude;
    }

    public Double getCheckInLongitude() {
      return checkInLongitude;
    }

    public String getCheckInPhotoUrl() {
      return checkInPhotoUrl;
    }

    public Double getCheckOutLatitude() {
      return checkOutLatitude;
    }

    public Double getCheckOutLongitude() {
      return checkOutLongitude;
    }

    public String getCheckOutPhotoUrl() {
      return checkOutPhotoUrl;
    }

    public AttendanceStatus getStatus() {
      return status;
    }
  }

  public static class UpsertAttendanceRangeRequest {
    @NotNull private Long employeeId;
    @NotNull private LocalDate fromDate;
    @NotNull private LocalDate toDate;
    private LocalTime inTime;
    private LocalTime outTime;
    private String leaveReason;

    public Long getEmployeeId() {
      return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
      this.employeeId = employeeId;
    }

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

    public LocalTime getInTime() {
      return inTime;
    }

    public void setInTime(LocalTime inTime) {
      this.inTime = inTime;
    }

    public LocalTime getOutTime() {
      return outTime;
    }

    public void setOutTime(LocalTime outTime) {
      this.outTime = outTime;
    }

    public String getLeaveReason() {
      return leaveReason;
    }

    public void setLeaveReason(String leaveReason) {
      this.leaveReason = leaveReason;
    }
  }
}
