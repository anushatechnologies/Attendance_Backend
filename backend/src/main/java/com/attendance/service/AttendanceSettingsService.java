package com.attendance.service;

import com.attendance.config.AppConfig;
import com.attendance.domain.AttendanceSettings;
import com.attendance.repo.AttendanceSettingsRepository;
import java.time.LocalTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceSettingsService {
  private static final long SINGLETON_ID = 1L;

  private final AttendanceSettingsRepository attendanceSettingsRepository;
  private final AppConfig appConfig;

  public AttendanceSettingsService(
      AttendanceSettingsRepository attendanceSettingsRepository, AppConfig appConfig) {
    this.attendanceSettingsRepository = attendanceSettingsRepository;
    this.appConfig = appConfig;
  }

  @Transactional
  public AttendanceSettings get() {
    AttendanceSettings s =
        attendanceSettingsRepository.findById(SINGLETON_ID).orElseGet(this::createDefault);
    ensureDefaults(s);
    return s;
  }

  @Transactional
  public AttendanceSettings update(LocalTime defaultInTime, LocalTime defaultOutTime) {
    AttendanceSettings s =
        attendanceSettingsRepository.findById(SINGLETON_ID).orElseGet(AttendanceSettings::new);
    s.setId(SINGLETON_ID);
    s.setDefaultInTime(defaultInTime);
    s.setDefaultOutTime(defaultOutTime);
    ensureDefaults(s);
    return attendanceSettingsRepository.save(s);
  }

  @Transactional
  public AttendanceSettings update(LocalTime defaultInTime, LocalTime defaultOutTime, String weekendDays) {
    AttendanceSettings s =
        attendanceSettingsRepository.findById(SINGLETON_ID).orElseGet(AttendanceSettings::new);
    s.setId(SINGLETON_ID);
    s.setDefaultInTime(defaultInTime);
    s.setDefaultOutTime(defaultOutTime);
    s.setWeekendDays(weekendDays);
    ensureDefaults(s);
    return attendanceSettingsRepository.save(s);
  }

  @Transactional
  public AttendanceSettings update(
      LocalTime defaultInTime,
      LocalTime defaultOutTime,
      String weekendDays,
      Integer fullDayMinutes,
      Integer halfDayMinutes) {
    if (fullDayMinutes == null || fullDayMinutes <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "fullDayMinutes must be > 0");
    }
    if (halfDayMinutes == null || halfDayMinutes <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "halfDayMinutes must be > 0");
    }
    if (halfDayMinutes > fullDayMinutes) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "halfDayMinutes must be <= fullDayMinutes");
    }

    AttendanceSettings s =
        attendanceSettingsRepository.findById(SINGLETON_ID).orElseGet(AttendanceSettings::new);
    s.setId(SINGLETON_ID);
    s.setDefaultInTime(defaultInTime);
    s.setDefaultOutTime(defaultOutTime);
    s.setWeekendDays(weekendDays);
    s.setFullDayMinutes(fullDayMinutes);
    s.setHalfDayMinutes(halfDayMinutes);
    ensureDefaults(s);
    return attendanceSettingsRepository.save(s);
  }

  @Transactional
  protected AttendanceSettings createDefault() {
    AttendanceSettings s = new AttendanceSettings();
    s.setId(SINGLETON_ID);
    s.setDefaultInTime(LocalTime.of(9, 0));
    s.setDefaultOutTime(LocalTime.of(18, 0));
    s.setWeekendDays("SUNDAY");
    s.setFullDayMinutes(appConfig.getAttendance().getMinDailyMinutes());
    s.setHalfDayMinutes(Math.max(1, appConfig.getAttendance().getMinDailyMinutes() / 2));
    return attendanceSettingsRepository.save(s);
  }

  private void ensureDefaults(AttendanceSettings s) {
    if (s.getFullDayMinutes() == null || s.getFullDayMinutes() <= 0) {
      s.setFullDayMinutes(appConfig.getAttendance().getMinDailyMinutes());
    }
    if (s.getHalfDayMinutes() == null || s.getHalfDayMinutes() <= 0) {
      s.setHalfDayMinutes(Math.max(1, s.getFullDayMinutes() / 2));
    }
    if (s.getHalfDayMinutes() > s.getFullDayMinutes()) {
      s.setHalfDayMinutes(Math.max(1, s.getFullDayMinutes() / 2));
    }
  }
}
