package com.placement.portal.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.placement.portal.model.User;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.core.convert.converter.Converter;

import java.util.Collections;
import java.util.List;

@Component
public class ClerkJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Value("${clerk.jwt.secret-key:default-secret-key-that-is-secure-and-long-enough-32-chars}")
    private String secretKey;

    private final UserRepository userRepo;

    public ClerkJwtAuthenticationConverter(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt source) {
        DecodedJWT decoded = JWT.require(Algorithm.HMAC256(secretKey))
                .build()
                .verify(source.getTokenValue());

        String email = decoded.getSubject();

        // Fetch role from DB for real-time privilege updates
        String role = userRepo.findByEmail(email)
                .map(u -> u.getRole().name())
                .orElseGet(() -> {
                    String r = decoded.getClaim("role").asString();
                    return r != null ? r : "STUDENT";
                });

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
        );

        return new JwtAuthenticationToken(source, authorities, email);
    }
}