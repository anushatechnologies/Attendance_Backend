package com.attendance.api;

import com.attendance.api.dto.AuthDtos;
import com.attendance.domain.AppUser;
import com.attendance.domain.Role;
import com.attendance.repo.EmployeeRepository;
import com.attendance.repo.UserRepository;
import com.attendance.security.JwtService;
import com.attendance.service.ApiException;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final UserRepository userRepository;
  private final EmployeeRepository employeeRepository;
  private final JwtService jwtService;

  public AuthController(
      AuthenticationManager authenticationManager,
      UserRepository userRepository,
      EmployeeRepository employeeRepository,
      JwtService jwtService) {
    this.authenticationManager = authenticationManager;
    this.userRepository = userRepository;
    this.employeeRepository = employeeRepository;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
    Authentication auth =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
    if (!auth.isAuthenticated()) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login");

    AppUser user =
        userRepository
            .findByUsername(req.getUsername())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid login"));
    String token = jwtService.createToken(user.getUsername(), user.getRole());
    if (user.getRole() == Role.ROLE_EMPLOYEE) {
      var emp =
          employeeRepository
              .findByUser_Id(user.getId())
              .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Employee profile missing"));
      return new AuthDtos.LoginResponse(token, user.getRole(), emp.getId(), emp.getName());
    }
    return new AuthDtos.LoginResponse(token, user.getRole(), null, user.getUsername());
  }

  @GetMapping("/me")
  public Map<String, Object> me() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String username = (String) auth.getPrincipal();
    AppUser user =
        userRepository
            .findByUsername(username)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));
    return Map.of("username", user.getUsername(), "role", user.getRole().name());
  }
}
