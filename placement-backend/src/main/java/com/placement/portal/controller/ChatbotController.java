package com.placement.portal.controller;

import com.placement.portal.model.User;
import com.placement.portal.repository.UserRepository;
import com.placement.portal.service.ChatbotService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepo;

    public ChatbotController(ChatbotService chatbotService, UserRepository userRepo) {
        this.chatbotService = chatbotService;
        this.userRepo = userRepo;
    }

    @PostMapping
    public ResponseEntity<?> chat(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        Long companyId = body.get("companyId") != null ? Long.valueOf(body.get("companyId").toString()) : null;

        String email = jwt.getSubject();
        User student = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        String reply = chatbotService.getChatbotResponse(message, student, companyId);

        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return ResponseEntity.ok(response);
    }
}
