package com.attendance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {
  private Jwt jwt = new Jwt();
  private Attendance attendance = new Attendance();
  private Cloudinary cloudinary = new Cloudinary();
  private Mail mail = new Mail();

  public Jwt getJwt() {
    return jwt;
  }

  public void setJwt(Jwt jwt) {
    this.jwt = jwt;
  }

  public Attendance getAttendance() {
    return attendance;
  }

  public void setAttendance(Attendance attendance) {
    this.attendance = attendance;
  }

  public Cloudinary getCloudinary() {
    return cloudinary;
  }

  public void setCloudinary(Cloudinary cloudinary) {
    this.cloudinary = cloudinary;
  }

  public Mail getMail() {
    return mail;
  }

  public void setMail(Mail mail) {
    this.mail = mail;
  }

  public static class Jwt {
    private String secret;
    private String issuer;
    private long expiresMinutes;

    public String getSecret() {
      return secret;
    }

    public void setSecret(String secret) {
      this.secret = secret;
    }

    public String getIssuer() {
      return issuer;
    }

    public void setIssuer(String issuer) {
      this.issuer = issuer;
    }

    public long getExpiresMinutes() {
      return expiresMinutes;
    }

    public void setExpiresMinutes(long expiresMinutes) {
      this.expiresMinutes = expiresMinutes;
    }
  }

  public static class Attendance {
    private int minDailyMinutes;
    private String defaultJoinDate;

    public int getMinDailyMinutes() {
      return minDailyMinutes;
    }

    public void setMinDailyMinutes(int minDailyMinutes) {
      this.minDailyMinutes = minDailyMinutes;
    }

    public String getDefaultJoinDate() {
      return defaultJoinDate;
    }

    public void setDefaultJoinDate(String defaultJoinDate) {
      this.defaultJoinDate = defaultJoinDate;
    }
  }

  public static class Cloudinary {
    private String cloudName;
    private String apiKey;
    private String apiSecret;

    public String getCloudName() {
      return cloudName;
    }

    public void setCloudName(String cloudName) {
      this.cloudName = cloudName;
    }

    public String getApiKey() {
      return apiKey;
    }

    public void setApiKey(String apiKey) {
      this.apiKey = apiKey;
    }

    public String getApiSecret() {
      return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
      this.apiSecret = apiSecret;
    }
  }

  public static class Mail {
    private boolean enabled;
    private String from;
    private String hrRecipients;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getFrom() {
      return from;
    }

    public void setFrom(String from) {
      this.from = from;
    }

    public String getHrRecipients() {
      return hrRecipients;
    }

    public void setHrRecipients(String hrRecipients) {
      this.hrRecipients = hrRecipients;
    }
  }
}
