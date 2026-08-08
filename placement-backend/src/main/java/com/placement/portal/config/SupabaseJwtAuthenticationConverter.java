package com.placement.portal.config;

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
public class SupabaseJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepo;

    public SupabaseJwtAuthenticationConverter(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt source) {
        String email = source.getClaimAsString("email");
        if (email == null || email.isEmpty()) {
            email = source.getSubject();
        }

        // Fetch role from DB for real-time privilege updates
        String role = userRepo.findByEmail(email)
                .map(u -> u.getRole().name())
                .orElseGet(() -> {
                    String r = source.getClaimAsString("role");
                    return r != null ? r : "STUDENT";
                });

        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
        );

        return new JwtAuthenticationToken(source, authorities, email);
    }
}