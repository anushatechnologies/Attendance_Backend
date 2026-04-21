package com.attendance.config;

import com.attendance.domain.AppUser;
import com.attendance.domain.Role;
import com.attendance.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {
  private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(String... args) {
    String username = env("INIT_ADMIN_USERNAME", "");
    String password = env("INIT_ADMIN_PASSWORD", "");

    if (!username.isBlank() && !password.isBlank()) {
      if (!userRepository.existsByUsername(username)) {
        AppUser admin = new AppUser();
        admin.setUsername(username);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);
        log.info("Seeded admin user '{}'", username);
      }
    } else {
      log.info(
          "Admin seeding skipped. Set INIT_ADMIN_USERNAME and INIT_ADMIN_PASSWORD to seed an admin account.");
    }

    String hrUsername = env("INIT_HR_USERNAME", "");
    String hrPassword = env("INIT_HR_PASSWORD", "");
    if (!hrUsername.isBlank()
        && !hrPassword.isBlank()
        && !userRepository.existsByUsername(hrUsername)) {
      AppUser hr = new AppUser();
      hr.setUsername(hrUsername);
      hr.setPasswordHash(passwordEncoder.encode(hrPassword));
      hr.setRole(Role.ROLE_HR);
      userRepository.save(hr);
      log.info("Seeded HR user '{}'", hrUsername);
    }
  }

  private static String env(String key, String def) {
    String v = System.getenv(key);
    if (v == null || v.isBlank()) return def;
    return v;
  }
}
