package com.placement.portal.controller;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final SkillEvidenceRepository evidenceRepo;

    public CompanyController(CompanyRepository companyRepo,
                             CompanyRequirementRepository requirementRepo,
                             UserRepository userRepo,
                             SkillRepository skillRepo,
                             SkillEvidenceRepository evidenceRepo) {
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
        this.evidenceRepo = evidenceRepo;
    }

    private User getAuthenticatedUser(Jwt jwt) {
        String email = jwt.getSubject();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    @GetMapping
    public ResponseEntity<?> listCompanies() {
        return ResponseEntity.ok(companyRepo.findAll());
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<?> getCompanyTasks(@PathVariable Long id) {
        Company company = companyRepo.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
        List<CompanyRequirement> reqs = requirementRepo.findByCompanyId(id);
        
        boolean isSql = reqs.stream().anyMatch(r -> r.getSkill().getName().equalsIgnoreCase("SQL"));
        
        List<Map<String, Object>> tasks = new ArrayList<>();

        // 1. Technical Interview Question
        Map<String, Object> qTask = new HashMap<>();
        qTask.put("id", 1);
        qTask.put("type", "question");
        if (isSql) {
            qTask.put("title", "SQL scenario: Second Highest Salary");
            qTask.put("content", "### Amazon Query Interview Question\nWrite a SQL query to select the second highest salary from the `Employees` table.\n\n```sql\nSELECT MAX(salary) \nFROM Employees \nWHERE salary < (SELECT MAX(salary) FROM Employees);\n```\nDiscuss if this index scan performs well or how to optimize it using LIMIT/OFFSET.");
        } else {
            qTask.put("title", "DSA Scenario: Maximum Depth of Binary Tree");
            qTask.put("content", "### Google Interview Question\nWrite a recursive method to calculate the maximum depth of a Binary Tree in Java.\n\n```java\npublic int maxDepth(TreeNode root) {\n    if (root == null) return 0;\n    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;\n}\n```\nAnalyze the call stack height and space complexity of this recursive solution.");
        }
        tasks.add(qTask);

        // 2. Mock MCQ Test Questions
        Map<String, Object> mTask = new HashMap<>();
        mTask.put("id", 2);
        mTask.put("type", "mock_test");
        mTask.put("title", company.getName() + " " + company.getRole() + " Mock Test");
        
        List<Map<String, Object>> questions = new ArrayList<>();
        if (isSql) {
            questions.add(createMCQ(1, "Which index physically sorts records inside a SQL table?", Arrays.asList("Non-Clustered Index", "Clustered Index", "Unique Hash Index", "Reverse Index")));
            questions.add(createMCQ(2, "What occurs during a LEFT JOIN when the right-hand table has no match?", Arrays.asList("No rows return", "Rows return with NULL in the right columns", "Query throws a syntax exception", "It acts as an INNER JOIN")));
        } else {
            questions.add(createMCQ(1, "What is the time complexity of pushing an item onto a Stack?", Arrays.asList("O(1)", "O(log n)", "O(n)", "O(n log n)")));
            questions.add(createMCQ(2, "Which data structure operates on a First-In-First-Out (FIFO) basis?", Arrays.asList("Stack", "Queue", "Binary Tree", "Linked List")));
        }
        mTask.put("content", questions);
        tasks.add(mTask);

        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{id}/mock-test/submit")
    public ResponseEntity<?> submitMockTest(@AuthenticationPrincipal Jwt jwt,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        List<Integer> answers = (List<Integer>) body.get("answers");
        
        Company company = companyRepo.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
        List<CompanyRequirement> reqs = requirementRepo.findByCompanyId(id);
        boolean isSql = reqs.stream().anyMatch(r -> r.getSkill().getName().equalsIgnoreCase("SQL"));

        // Grade mock test
        List<Integer> correctAnswers = Arrays.asList(1, 1); // Index 1 is Clustered Index and Left join NULL columns
        if (!isSql) {
            correctAnswers = Arrays.asList(0, 1); // Index 0 is O(1) stack push, Index 1 is Queue
        }

        int correct = 0;
        for (int i = 0; i < Math.min(answers.size(), correctAnswers.size()); i++) {
            if (answers.get(i).equals(correctAnswers.get(i))) {
                correct++;
            }
        }

        int scorePercent = Math.round(((float) correct / correctAnswers.size()) * 100);
        double rating = Math.max(1.0, Math.round(((double) correct / correctAnswers.size()) * 5.0 * 10.0) / 10.0);

        // Save mock test evidence for student
        String skillName = isSql ? "SQL" : "DSA";
        Skill skill = skillRepo.findByName(skillName)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(skillName);
                    s.setCategory(SkillCategory.TECHNICAL);
                    return skillRepo.save(s);
                });

        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType(EvidenceType.MOCK_TEST);
        evidence.setRawScore((double) scorePercent);
        evidence.setDerivedRating(rating);
        evidence.setComment("Completed mock test for " + company.getName() + " placement drive.");
        evidence.setCreatedAt(LocalDateTime.now());
        evidenceRepo.save(evidence);

        Map<String, Object> res = new HashMap<>();
        res.put("score", scorePercent);
        res.put("correct", correct);
        res.put("total", correctAnswers.size());
        return ResponseEntity.ok(res);
    }

    private Map<String, Object> createMCQ(int id, String text, List<String> options) {
        Map<String, Object> q = new HashMap<>();
        q.put("id", id);
        q.put("question", text);
        q.put("options", options);
        return q;
    }
}
