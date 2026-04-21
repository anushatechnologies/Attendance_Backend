package com.attendance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "attendance_entries",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_attendance_emp_date",
          columnNames = {"employee_id", "entry_date"})
    })
public class AttendanceEntry {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "employee_id", nullable = false)
  private Employee employee;

  @Column(name = "entry_date", nullable = false)
  private LocalDate date;

  @Column(name = "in_time")
  private LocalTime inTime;

  @Column(name = "out_time")
  private LocalTime outTime;

  @Column(name = "worked_minutes")
  private Integer workedMinutes;

  @Column(name = "leave_reason", length = 255)
  private String leaveReason;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private AttendanceStatus status;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Employee getEmployee() {
    return employee;
  }

  public void setEmployee(Employee employee) {
    this.employee = employee;
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

  public Integer getWorkedMinutes() {
    return workedMinutes;
  }

  public void setWorkedMinutes(Integer workedMinutes) {
    this.workedMinutes = workedMinutes;
  }

  public String getLeaveReason() {
    return leaveReason;
  }

  public void setLeaveReason(String leaveReason) {
    this.leaveReason = leaveReason;
  }

  public AttendanceStatus getStatus() {
    return status;
  }

  public void setStatus(AttendanceStatus status) {
    this.status = status;
  }
}
