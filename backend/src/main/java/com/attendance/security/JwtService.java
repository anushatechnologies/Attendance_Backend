package com.attendance.security;

import com.attendance.config.AppConfig;
import com.attendance.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final AppConfig appConfig;

  public JwtService(AppConfig appConfig) {
    this.appConfig = appConfig;
  }

  private SecretKey signingKey() {
    byte[] bytes = appConfig.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(bytes);
  }

  public String createToken(String username, Role role) {
    Instant now = Instant.now();
    Instant expiry = now.plusSeconds(appConfig.getJwt().getExpiresMinutes() * 60L);
    return Jwts.builder()
        .issuer(appConfig.getJwt().getIssuer())
        .subject(username)
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiry))
        .claim("role", role.name())
        .signWith(signingKey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith(signingKey())
        .requireIssuer(appConfig.getJwt().getIssuer())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
