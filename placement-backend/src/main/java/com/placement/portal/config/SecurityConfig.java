package com.placement.portal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.SecurityFilterChain;
import java.time.Instant;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${clerk.jwt.secret-key:default-secret-key-that-is-secure-and-long-enough-32-chars}")
    private String secretKey;

    private final ClerkJwtAuthenticationConverter authenticationConverter;

    public SecurityConfig(ClerkJwtAuthenticationConverter authenticationConverter) {
        this.authenticationConverter = authenticationConverter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            try {
                com.auth0.jwt.interfaces.DecodedJWT decoded = com.auth0.jwt.JWT.require(com.auth0.jwt.algorithms.Algorithm.HMAC256(secretKey))
                        .build()
                        .verify(token);

                return Jwt.withTokenValue(token)
                        .header("alg", "HS256")
                        .subject(decoded.getSubject())
                        .claim("email", decoded.getClaim("email").asString())
                        .issuedAt(decoded.getIssuedAt() != null ? decoded.getIssuedAt().toInstant() : Instant.now())
                        .expiresAt(decoded.getExpiresAt() != null ? decoded.getExpiresAt().toInstant() : Instant.now().plusSeconds(86400))
                        .build();
            } catch (Exception e) {
                throw new JwtException("Local JWT decoding failed", e);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/public/**", "/uploads/**").permitAll()
                .requestMatchers("/api/student/**").hasRole("STUDENT")
                .requestMatchers("/api/faculty/**").hasRole("FACULTY")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter))
            );
        return http.build();
    }
}