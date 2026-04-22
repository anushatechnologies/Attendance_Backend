package com.attendance.api;

import com.attendance.api.dto.OfficeDtos;
import com.attendance.service.OfficeLocationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/office-location")
public class OfficeLocationController {
  private final OfficeLocationService officeLocationService;

  public OfficeLocationController(OfficeLocationService officeLocationService) {
    this.officeLocationService = officeLocationService;
  }

  @GetMapping("/active")
  public OfficeDtos.OfficeLocationResponse active() {
    var loc = officeLocationService.getActiveOrThrow();
    return new OfficeDtos.OfficeLocationResponse(
        loc.getId(),
        loc.getOfficeName(),
        loc.getLatitude(),
        loc.getLongitude(),
        loc.getRadiusMeters(),
        loc.isActive(),
        loc.getUpdatedAt());
  }
}

