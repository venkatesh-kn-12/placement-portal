package com.placement.portal.controller;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final SkillRepository skillRepo;
    private final StudentCourseProgressRepository progressRepo;

    public AdminController(UserRepository userRepo,
                           CompanyRepository companyRepo,
                           CompanyRequirementRepository requirementRepo,
                           SkillRepository skillRepo,
                           StudentCourseProgressRepository progressRepo) {
        this.userRepo = userRepo;
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.skillRepo = skillRepo;
        this.progressRepo = progressRepo;
    }

    private User getAuthenticatedUser(Jwt jwt) {
        String email = jwt.getSubject();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin user not found."));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt); // Access control
        return ResponseEntity.ok(userRepo.findAll());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@AuthenticationPrincipal Jwt jwt,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, String> body) {
        getAuthenticatedUser(jwt);
        String roleStr = body.get("role");
        
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found."));

        user.setRole(Role.valueOf(roleStr.toUpperCase()));
        userRepo.save(user);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        getAuthenticatedUser(jwt);

        String name = (String) body.get("name");
        String role = (String) body.get("role");
        String description = (String) body.get("description");
        
        Map<String, Object> minScores = (Map<String, Object>) body.get("min_test_scores");
        List<String> requiredSkills = (List<String>) body.get("skills");

        Company company = new Company();
        company.setName(name);
        company.setVisitDate(LocalDate.now().plusMonths(2));
        company.setMinCgpa(7.0);
        company.setRole(role);
        company.setDescription(description);
        company = companyRepo.save(company);

        // Bind Skill Requirements
        for (String skillName : requiredSkills) {
            Skill skill = skillRepo.findByName(skillName)
                    .orElseGet(() -> {
                        Skill s = new Skill();
                        s.setName(skillName);
                        s.setCategory(SkillCategory.TECHNICAL);
                        return skillRepo.save(s);
                    });

            CompanyRequirement req = new CompanyRequirement();
            req.setCompany(company);
            req.setSkill(skill);
            req.setMinRating(3.5); // Default threshold rating
            req.setWeightage(1.0);
            requirementRepo.save(req);
        }

        // Also add Aptitude, Coding and Soft Skills requirements as standard criteria
        addStandardRequirement(company, "Quantitative Aptitude", SkillCategory.APTITUDE, Double.valueOf(minScores.get("aptitude").toString()));
        addStandardRequirement(company, "Core Coding", SkillCategory.TECHNICAL, Double.valueOf(minScores.get("coding").toString()));
        addStandardRequirement(company, "Soft Skills", SkillCategory.SOFT_SKILL, Double.valueOf(minScores.get("soft_skills").toString()));

        return ResponseEntity.ok(company);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt);

        List<User> all = userRepo.findAll();
        long students = all.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long faculty = all.stream().filter(u -> u.getRole() == Role.FACULTY).count();
        long companies = companyRepo.count();

        // Calculate earned badges count
        List<StudentCourseProgress> progresses = progressRepo.findAll();
        Map<String, Long> badgeCounts = progresses.stream()
                .filter(StudentCourseProgress::getBadgeEarned)
                .collect(Collectors.groupingBy(p -> p.getCourse().getBadgeName(), Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("total_students", students);
        stats.put("total_faculty", faculty);
        stats.put("total_companies", companies);
        stats.put("average_readiness_base", 3.8); // Default base target indicator
        stats.put("badge_statistics", badgeCounts);

        return ResponseEntity.ok(stats);
    }

    private void addStandardRequirement(Company company, String name, SkillCategory cat, Double minRating) {
        Skill skill = skillRepo.findByName(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory(cat);
                    return skillRepo.save(s);
                });

        CompanyRequirement req = new CompanyRequirement();
        req.setCompany(company);
        req.setSkill(skill);
        req.setMinRating(minRating);
        req.setWeightage(1.0);
        requirementRepo.save(req);
    }
}
