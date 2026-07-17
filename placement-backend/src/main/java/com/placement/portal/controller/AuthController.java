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
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${clerk.jwt.secret-key:default-secret-key-that-is-secure-and-long-enough-32-chars}")
    private String secretKey;

    public AuthController(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private String generateToken(String email) {
        return com.auth0.jwt.JWT.create()
                .withSubject(email)
                .withClaim("email", email)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .sign(com.auth0.jwt.algorithms.Algorithm.HMAC256(secretKey));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("fullName");

        if (email == null || password == null || fullName == null || email.trim().isEmpty() || password.trim().isEmpty() || fullName.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "All fields are required."));
        }

        String formattedEmail = email.toLowerCase().trim();
        if (userRepo.findByEmail(formattedEmail).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email is already registered."));
        }

        User user = new User();
        user.setEmail(formattedEmail);
        user.setFullName(fullName.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.STUDENT);
        user.setCreatedAt(LocalDateTime.now());
        userRepo.save(user);

        String token = generateToken(formattedEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email and password are required."));
        }

        String formattedEmail = email.toLowerCase().trim();
        Optional<User> userOpt = userRepo.findByEmail(formattedEmail);

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password."));
        }

        User user = userOpt.get();
        String token = generateToken(formattedEmail);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getSubject();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database."));
        return ResponseEntity.ok(user);
    }
}
