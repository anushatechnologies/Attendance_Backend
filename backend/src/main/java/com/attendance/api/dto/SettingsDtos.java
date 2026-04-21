package com.attendance.api.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public class SettingsDtos {
  public static class AttendanceSettingsResponse {
    private LocalTime defaultInTime;
    private LocalTime defaultOutTime;
    private String weekendDays;
    private Integer fullDayMinutes;
    private Integer halfDayMinutes;

    public AttendanceSettingsResponse(
        LocalTime defaultInTime,
        LocalTime defaultOutTime,
        String weekendDays,
        Integer fullDayMinutes,
        Integer halfDayMinutes) {
      this.defaultInTime = defaultInTime;
      this.defaultOutTime = defaultOutTime;
      this.weekendDays = weekendDays;
      this.fullDayMinutes = fullDayMinutes;
      this.halfDayMinutes = halfDayMinutes;
    }

    public LocalTime getDefaultInTime() {
      return defaultInTime;
    }

    public LocalTime getDefaultOutTime() {
      return defaultOutTime;
    }

    public String getWeekendDays() {
      return weekendDays;
    }

    public Integer getFullDayMinutes() {
      return fullDayMinutes;
    }

    public Integer getHalfDayMinutes() {
      return halfDayMinutes;
    }
  }

  public static class UpdateAttendanceSettingsRequest {
    @NotNull private LocalTime defaultInTime;
    @NotNull private LocalTime defaultOutTime;
    @NotNull private String weekendDays;
    @NotNull private Integer fullDayMinutes;
    @NotNull private Integer halfDayMinutes;

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
}
