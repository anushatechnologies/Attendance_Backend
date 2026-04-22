package com.attendance.service;

import com.attendance.domain.AttendanceEntry;
import com.attendance.domain.Employee;
import com.attendance.repo.AttendanceRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AttendancePunchService {
  private final AttendanceRepository attendanceRepository;
  private final AttendanceService attendanceService;
  private final OfficeLocationService officeLocationService;
  private final CloudinaryService cloudinaryService;

  public AttendancePunchService(
      AttendanceRepository attendanceRepository,
      AttendanceService attendanceService,
      OfficeLocationService officeLocationService,
      CloudinaryService cloudinaryService) {
    this.attendanceRepository = attendanceRepository;
    this.attendanceService = attendanceService;
    this.officeLocationService = officeLocationService;
    this.cloudinaryService = cloudinaryService;
  }

  @Transactional
  public AttendanceEntry checkIn(Employee employee, double latitude, double longitude, MultipartFile photo) {
    assertWithinOffice(latitude, longitude);

    LocalDate today = LocalDate.now();
    var existing = attendanceRepository.findByEmployee_IdAndDate(employee.getId(), today).orElse(null);
    if (existing != null && existing.getInTime() != null) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "Already checked in today at " + existing.getInTime().truncatedTo(ChronoUnit.MINUTES));
    }

    LocalTime inTime = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);
    AttendanceEntry entry =
        attendanceService.upsert(employee.getId(), today, inTime, null, null, false);

    var upload =
        cloudinaryService.uploadAttendancePhoto(
            photo, "emp-" + employee.getId() + "/" + today + "/checkin");
    entry.setCheckInLatitude(latitude);
    entry.setCheckInLongitude(longitude);
    entry.setCheckInPhotoUrl(upload.url());
    return attendanceRepository.save(entry);
  }

  @Transactional
  public AttendanceEntry checkOut(Employee employee, double latitude, double longitude, MultipartFile photo) {
    assertWithinOffice(latitude, longitude);

    LocalDate today = LocalDate.now();
    AttendanceEntry existing =
        attendanceRepository
            .findByEmployee_IdAndDate(employee.getId(), today)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No check-in found for today"));

    if (existing.getInTime() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "No check-in found for today");
    }
    if (existing.getOutTime() != null) {
      throw new ApiException(
          HttpStatus.CONFLICT,
          "Already checked out today at " + existing.getOutTime().truncatedTo(ChronoUnit.MINUTES));
    }

    LocalTime outTime = LocalTime.now().truncatedTo(ChronoUnit.MINUTES);
    AttendanceEntry entry =
        attendanceService.upsert(employee.getId(), today, existing.getInTime(), outTime, null, false);

    var upload =
        cloudinaryService.uploadAttendancePhoto(
            photo, "emp-" + employee.getId() + "/" + today + "/checkout");
    entry.setCheckOutLatitude(latitude);
    entry.setCheckOutLongitude(longitude);
    entry.setCheckOutPhotoUrl(upload.url());
    return attendanceRepository.save(entry);
  }

  private void assertWithinOffice(double latitude, double longitude) {
    var office = officeLocationService.getActiveOrThrow();
    double distance =
        OfficeLocationService.distanceMeters(
            office.getLatitude(), office.getLongitude(), latitude, longitude);
    if (distance > office.getRadiusMeters()) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "Outside office radius. Distance: "
              + Math.round(distance)
              + "m, Allowed: "
              + Math.round(office.getRadiusMeters())
              + "m");
    }
  }
}

