package com.attendance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_settings")
public class AttendanceSettings {
  @Id
  private Long id = 1L;

  @Column(name = "default_in_time")
  private LocalTime defaultInTime;

  @Column(name = "default_out_time")
  private LocalTime defaultOutTime;

  @Column(name = "weekend_days", length = 50)
  private String weekendDays;

  @Column(name = "full_day_minutes")
  private Integer fullDayMinutes;

  @Column(name = "half_day_minutes")
  private Integer halfDayMinutes;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public LocalTime getDefaultInTime() {
    return defaultInTime;
  }

  public void setDefaultInTime(LocalTime defaultInTime) {
    this.defaultInTime = defaultInTime;
  }

  public LocalTime getDefaultOutTime() {
    return defaultOutTime;
  }

  public void setDefaultOutTime(LocalTime defaultOutTime) {
    this.defaultOutTime = defaultOutTime;
  }

  public String getWeekendDays() {
    return weekendDays;
  }

  public void setWeekendDays(String weekendDays) {
    this.weekendDays = weekendDays;
  }

  public Integer getFullDayMinutes() {
    return fullDayMinutes;
  }

  public void setFullDayMinutes(Integer fullDayMinutes) {
    this.fullDayMinutes = fullDayMinutes;
  }

  public Integer getHalfDayMinutes() {
    return halfDayMinutes;
  }

  public void setHalfDayMinutes(Integer halfDayMinutes) {
    this.halfDayMinutes = halfDayMinutes;
  }
}
