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
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${supabase.url:https://nwwrxsedvmlgehfauwzb.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.jwt.secret:default-secret-key-that-is-secure-and-long-enough-32-chars}")
    private String secretKey;

    private final SupabaseJwtAuthenticationConverter authenticationConverter;

    public SecurityConfig(SupabaseJwtAuthenticationConverter authenticationConverter) {
        this.authenticationConverter = authenticationConverter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            return execution.execute(request, body);
        });

        return org.springframework.security.oauth2.jwt.NimbusJwtDecoder
                .withJwkSetUri(supabaseUrl + "/auth/v1/.well-known/jwks.json")
                .restOperations(restTemplate)
                .jwsAlgorithm(org.springframework.security.oauth2.jose.jws.SignatureAlgorithm.ES256)
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults())
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
                .authenticationEntryPoint((request, response, authException) -> {
                    System.err.println("JWT Verification Failed: " + authException.getMessage());
                    if (authException.getCause() != null) {
                        System.err.println("Cause: " + authException.getCause().getMessage());
                    }
                    response.sendError(401, "Unauthorized");
                })
                .jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter))
            );

        return http.build();
    }
}