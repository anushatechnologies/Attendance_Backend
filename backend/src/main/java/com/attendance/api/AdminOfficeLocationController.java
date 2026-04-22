package com.attendance.api;

import com.attendance.api.dto.OfficeDtos;
import com.attendance.service.OfficeLocationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/office-location")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminOfficeLocationController {
  private final OfficeLocationService officeLocationService;

  public AdminOfficeLocationController(OfficeLocationService officeLocationService) {
    this.officeLocationService = officeLocationService;
  }

  @GetMapping("/active")
  public OfficeDtos.OfficeLocationResponse active() {
    var loc = officeLocationService.getActiveOrNull();
    if (loc == null) return null;
    return new OfficeDtos.OfficeLocationResponse(
        loc.getId(),
        loc.getOfficeName(),
        loc.getLatitude(),
        loc.getLongitude(),
        loc.getRadiusMeters(),
        loc.isActive(),
        loc.getUpdatedAt());
  }

  @PostMapping("/active")
  public OfficeDtos.OfficeLocationResponse upsertActive(
      @Valid @RequestBody OfficeDtos.UpsertOfficeLocationRequest req) {
    var loc =
        officeLocationService.upsertActive(
            req.getOfficeName(), req.getLatitude(), req.getLongitude(), req.getRadiusMeters());
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

