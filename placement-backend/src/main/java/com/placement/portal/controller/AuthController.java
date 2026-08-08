package com.placement.portal.controller;

import com.placement.portal.model.Role;
import com.placement.portal.model.User;
import com.placement.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }



    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@RequestBody Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        // Fallback to body email if jwt is not fully injected due to permitAll, but normally JWT is preferred.
        String email = null;
        if (jwt != null) {
            email = jwt.getClaimAsString("email");
            if (email == null || email.isEmpty()) email = jwt.getSubject();
        } else {
            email = body.get("email");
        }
        String fullName = body.get("fullName");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email is required."));
        }

        String formattedEmail = email.toLowerCase().trim();
        Optional<User> existingUser = userRepo.findByEmail(formattedEmail);

        if (existingUser.isEmpty()) {
            User user = new User();
            user.setEmail(formattedEmail);
            user.setFullName(fullName != null ? fullName.trim() : "Student");
            user.setRole(Role.STUDENT);
            user.setCreatedAt(LocalDateTime.now());
            userRepo.save(user);
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.ok(existingUser.get());
    }
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isEmpty()) email = jwt.getSubject();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database."));
        return ResponseEntity.ok(user);
    }
}
