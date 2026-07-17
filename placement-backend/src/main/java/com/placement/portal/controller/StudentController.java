package com.placement.portal.controller;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import com.placement.portal.service.ReadinessScoreService;
import com.placement.portal.service.ResumeService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final SkillEvidenceRepository evidenceRepo;
    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final ReadinessScoreService scoreService;
    private final ResumeService resumeService;
    private final StudentProfileRepository profileRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final StudentProjectRepository projectRepo;
    private final StudentCertificateRepository certificateRepo;
    private final QuizQuestionRepository quizRepo;

    public StudentController(UserRepository userRepo,
                             SkillRepository skillRepo,
                             SkillEvidenceRepository evidenceRepo,
                             CompanyRepository companyRepo,
                             CompanyRequirementRepository requirementRepo,
                             ReadinessScoreService scoreService,
                             ResumeService resumeService,
                             StudentProfileRepository profileRepo,
                             StudentSkillRepository studentSkillRepo,
                             StudentProjectRepository projectRepo,
                             StudentCertificateRepository certificateRepo,
                             QuizQuestionRepository quizRepo) {
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
        this.evidenceRepo = evidenceRepo;
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.scoreService = scoreService;
        this.resumeService = resumeService;
        this.profileRepo = profileRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.projectRepo = projectRepo;
        this.certificateRepo = certificateRepo;
        this.quizRepo = quizRepo;
    }

    private User getAuthenticatedUser(Jwt jwt) {
        String email = jwt.getSubject();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student record not found."));
    }

    private String saveUploadedFile(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) return null;
        try {
            String folderPath = "uploads/" + subfolder;
            File folder = new File(folderPath);
            if (!folder.exists()) {
                folder.mkdirs();
            }
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path path = Paths.get(folderPath, fileName);
            Files.write(path, file.getBytes());
            return "/uploads/" + subfolder + "/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Could not save uploaded file", e);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        StudentProfile profile = profileRepo.findByUserId(student.getId())
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile(student);
                    return profileRepo.save(p);
                });
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody StudentProfile updated) {
        User student = getAuthenticatedUser(jwt);
        StudentProfile profile = profileRepo.findByUserId(student.getId())
                .orElseGet(() -> new StudentProfile(student));

        profile.setPhone(updated.getPhone());
        profile.setGender(updated.getGender());
        profile.setDob(updated.getDob());
        profile.setRelocationCities(updated.getRelocationCities());
        profile.setTemporaryAddress(updated.getTemporaryAddress());
        profile.setAadharNumber(updated.getAadharNumber());
        profile.setPassportNumber(updated.getPassportNumber());
        profile.setPanCardNumber(updated.getPanCardNumber());
        profile.setParentName(updated.getParentName());
        profile.setParentPhone(updated.getParentPhone());
        profile.setParentRelation(updated.getParentRelation());
        profile.setHighestDegree(updated.getHighestDegree());
        profile.setHighestYop(updated.getHighestYop());
        profile.setSslcPercentage(updated.getSslcPercentage());
        profile.setSslcYop(updated.getSslcYop());
        profile.setPucPercentage(updated.getPucPercentage());
        profile.setPucYop(updated.getPucYop());
        profile.setPucYearGap(updated.getPucYearGap());
        profile.setDegreeCgpa(updated.getDegreeCgpa());
        profile.setDegreeYop(updated.getDegreeYop());
        profile.setDegreeName(updated.getDegreeName());
        profile.setDegreeStream(updated.getDegreeStream());
        profile.setDegreeCollege(updated.getDegreeCollege());
        profile.setDegreeUniversity(updated.getDegreeUniversity());
        profile.setDegreeYearGap(updated.getDegreeYearGap());
        profile.setHasPg(updated.getHasPg());
        profile.setPgDegree(updated.getPgDegree());
        profile.setPgStream(updated.getPgStream());
        profile.setPgCollege(updated.getPgCollege());
        profile.setPgUniversity(updated.getPgUniversity());
        profile.setPgYop(updated.getPgYop());
        profile.setPgYearGap(updated.getPgYearGap());
        profile.setPgSem1Cgpa(updated.getPgSem1Cgpa());
        profile.setPgSem2Cgpa(updated.getPgSem2Cgpa());
        profile.setPgSem3Cgpa(updated.getPgSem3Cgpa());
        profile.setPgSem4Cgpa(updated.getPgSem4Cgpa());
        profile.setPgSem5Cgpa(updated.getPgSem5Cgpa());
        profile.setPgSem6Cgpa(updated.getPgSem6Cgpa());

        return ResponseEntity.ok(profileRepo.save(profile));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadProfilePhoto(@AuthenticationPrincipal Jwt jwt, @RequestParam("file") MultipartFile file) {
        User student = getAuthenticatedUser(jwt);
        StudentProfile profile = profileRepo.findByUserId(student.getId())
                .orElseGet(() -> new StudentProfile(student));
        String path = saveUploadedFile(file, "profile_photos");
        profile.setProfilePhotoPath(path);
        profileRepo.save(profile);
        return ResponseEntity.ok(Map.of("path", path));
    }

    @GetMapping("/skills")
    public ResponseEntity<?> getSkills(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        return ResponseEntity.ok(studentSkillRepo.findByStudentId(student.getId()));
    }

    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("skillName") String skillName,
            @RequestParam("level") String level,
            @RequestParam(value = "certificate", required = false) MultipartFile certificateFile) {
        User student = getAuthenticatedUser(jwt);
        
        Skill skill = skillRepo.findByName(skillName)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(skillName);
                    s.setCategory(SkillCategory.TECHNICAL);
                    return skillRepo.save(s);
                });

        StudentSkill studentSkill = studentSkillRepo.findByStudentIdAndSkillId(student.getId(), skill.getId())
                .orElseGet(() -> new StudentSkill(student, skill, level));

        studentSkill.setLevel(level);

        if (certificateFile != null && !certificateFile.isEmpty()) {
            String path = saveUploadedFile(certificateFile, "certificates");
            studentSkill.setCertificateFilePath(path);
            studentSkill.setCertificateStatus("PENDING");
            
            // Create a corresponding StudentCertificate record so faculty can review it!
            StudentCertificate certificate = new StudentCertificate();
            certificate.setStudent(student);
            certificate.setSkill(skill);
            certificate.setTitle(skillName + " Certificate");
            certificate.setIssuingAuthority("Uploaded via Skill Tab");
            certificate.setVerificationLink("");
            certificate.setFilePath(path);
            certificate.setStatus("PENDING");
            certificateRepo.save(certificate);

            // Create SkillEvidence for faculty review flow
            Skill reviewSkill = getOrSeedSkill("Certificate Review", SkillCategory.TECHNICAL);
            SkillEvidence evidence = new SkillEvidence();
            evidence.setStudent(student);
            evidence.setSkill(reviewSkill);
            evidence.setType(EvidenceType.CERTIFICATE);
            evidence.setRawScore(0.0);
            evidence.setDerivedRating(null); // Pending
            evidence.setComment(certificate.getTitle() + "||Uploaded via Skill Tab||||" + certificate.getId());
            evidenceRepo.save(evidence);
        }

        return ResponseEntity.ok(studentSkillRepo.save(studentSkill));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<?> removeSkill(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        User student = getAuthenticatedUser(jwt);
        StudentSkill studentSkill = studentSkillRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found."));
        if (!studentSkill.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        studentSkillRepo.delete(studentSkill);
        return ResponseEntity.ok(Map.of("message", "Skill removed"));
    }

    @GetMapping("/skills/mocktest")
    public ResponseEntity<?> getSkillsMockTest(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        List<StudentSkill> studentSkills = studentSkillRepo.findByStudentId(student.getId());
        if (studentSkills.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please add at least one skill to generate a customized mock test."));
        }

        List<QuizQuestion> questionPool = new ArrayList<>();
        for (StudentSkill ss : studentSkills) {
            questionPool.addAll(quizRepo.findBySkillId(ss.getSkill().getId()));
        }

        // Shuffle and take up to 20 questions
        Collections.shuffle(questionPool);
        List<QuizQuestion> testQuestions = new ArrayList<>();
        int limit = Math.min(20, questionPool.size());
        for (int i = 0; i < limit; i++) {
            testQuestions.add(questionPool.get(i));
        }

        // If we have fewer than 20 questions, fill from the general pool
        if (testQuestions.size() < 20) {
            List<QuizQuestion> allQuestions = quizRepo.findAll();
            for (QuizQuestion q : allQuestions) {
                if (testQuestions.size() >= 20) break;
                if (!testQuestions.contains(q)) {
                    testQuestions.add(q);
                }
            }
        }

        List<Map<String, Object>> responseQs = new ArrayList<>();
        for (QuizQuestion q : testQuestions) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", q.getId());
            item.put("question", q.getQuestion());
            item.put("options", Arrays.asList(q.getOptions().split(",")));
            responseQs.add(item);
        }

        return ResponseEntity.ok(Map.of("questions", responseQs));
    }

    @PostMapping("/skills/mocktest/submit")
    public ResponseEntity<?> submitSkillsMockTest(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");
        
        int score = 0;
        int total = answers.size();
        List<Map<String, Object>> breakdown = new ArrayList<>();

        for (Map<String, Object> ans : answers) {
            Long qId = Long.valueOf(ans.get("id").toString());
            int selected = Integer.parseInt(ans.get("selected").toString());
            
            QuizQuestion q = quizRepo.findById(qId).orElse(null);
            if (q != null) {
                boolean isCorrect = (selected == q.getAnswer());
                if (isCorrect) score++;
                
                Map<String, Object> review = new HashMap<>();
                review.put("questionId", qId);
                review.put("questionText", q.getQuestion());
                List<String> opts = Arrays.asList(q.getOptions().split(","));
                review.put("selectedOption", selected >= 0 ? opts.get(selected) : "Unanswered");
                review.put("correctOption", opts.get(q.getAnswer()));
                review.put("isCorrect", isCorrect);
                review.put("explanation", "Correct answer is " + opts.get(q.getAnswer()));
                breakdown.add(review);
            }
        }

        double rating = Math.max(1.0, Math.round(((double) score / total) * 5.0 * 10.0) / 10.0);

        // Update student skills ratings matching the test questions
        List<StudentSkill> studentSkills = studentSkillRepo.findByStudentId(student.getId());
        for (StudentSkill ss : studentSkills) {
            boolean hasQuestions = false;
            int skillScore = 0;
            int skillTotal = 0;
            for (Map<String, Object> ans : answers) {
                Long qId = Long.valueOf(ans.get("id").toString());
                int selected = Integer.parseInt(ans.get("selected").toString());
                QuizQuestion q = quizRepo.findById(qId).orElse(null);
                if (q != null && q.getSkill() != null && q.getSkill().getId().equals(ss.getSkill().getId())) {
                    hasQuestions = true;
                    skillTotal++;
                    if (selected == q.getAnswer()) skillScore++;
                }
            }
            if (hasQuestions) {
                double skillRating = Math.max(1.0, Math.round(((double) skillScore / skillTotal) * 5.0 * 10.0) / 10.0);
                ss.setRating(skillRating);
                studentSkillRepo.save(ss);

                SkillEvidence evidence = new SkillEvidence();
                evidence.setStudent(student);
                evidence.setSkill(ss.getSkill());
                evidence.setType(EvidenceType.MOCK_TEST);
                evidence.setRawScore((double) skillScore);
                evidence.setDerivedRating(skillRating);
                evidence.setComment("Skills mock test rating update.");
                evidenceRepo.save(evidence);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("max_score", total);
        result.put("rating", rating);
        result.put("breakdown", breakdown);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        return ResponseEntity.ok(projectRepo.findByStudentId(student.getId()));
    }

    @PostMapping("/projects")
    public ResponseEntity<?> uploadProject(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("gitLink") String gitLink,
            @RequestParam("hostedLink") String hostedLink,
            @RequestParam(value = "document", required = false) MultipartFile documentFile,
            @RequestParam(value = "diagram", required = false) MultipartFile diagramFile) {
        User student = getAuthenticatedUser(jwt);

        StudentProject project = new StudentProject();
        project.setStudent(student);
        project.setTitle(title);
        project.setDescription(description);
        project.setGitLink(gitLink);
        project.setHostedLink(hostedLink);

        if (documentFile != null && !documentFile.isEmpty()) {
            project.setDocumentPath(saveUploadedFile(documentFile, "project_docs"));
        }
        if (diagramFile != null && !diagramFile.isEmpty()) {
            project.setDiagramPath(saveUploadedFile(diagramFile, "project_diagrams"));
        }

        projectRepo.save(project);
        
        Skill skill = getOrSeedSkill("Project Review", SkillCategory.TECHNICAL);
        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType(EvidenceType.FACULTY_RATING);
        evidence.setRawScore(0.0);
        evidence.setDerivedRating(null); // Pending review
        evidence.setComment(title + "||" + description + "||" + gitLink + "||" + hostedLink + "||" + project.getId());
        evidenceRepo.save(evidence);

        return ResponseEntity.ok(project);
    }

    @GetMapping("/certificates")
    public ResponseEntity<?> getCertificates(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        return ResponseEntity.ok(certificateRepo.findByStudentId(student.getId()));
    }

    @PostMapping("/certificates")
    public ResponseEntity<?> uploadCertificate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("title") String title,
            @RequestParam("issuingAuthority") String issuingAuthority,
            @RequestParam("verificationLink") String verificationLink,
            @RequestParam(value = "skillId", required = false) Long skillId,
            @RequestParam("file") MultipartFile file) {
        User student = getAuthenticatedUser(jwt);

        StudentCertificate certificate = new StudentCertificate();
        certificate.setStudent(student);
        certificate.setTitle(title);
        certificate.setIssuingAuthority(issuingAuthority);
        certificate.setVerificationLink(verificationLink);
        if (skillId != null) {
            skillRepo.findById(skillId).ifPresent(certificate::setSkill);
        }

        if (file != null && !file.isEmpty()) {
            certificate.setFilePath(saveUploadedFile(file, "certificates"));
        }

        certificateRepo.save(certificate);

        Skill skill = getOrSeedSkill("Certificate Review", SkillCategory.TECHNICAL);
        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType(EvidenceType.CERTIFICATE);
        evidence.setRawScore(0.0);
        evidence.setDerivedRating(null); // Pending
        evidence.setComment(title + "||" + issuingAuthority + "||" + verificationLink + "||" + certificate.getId());
        evidenceRepo.save(evidence);

        return ResponseEntity.ok(certificate);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        List<Company> companies = companyRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Company company : companies) {
            double match = scoreService.computeCompanyMatch(student.getId(), company.getId());
            List<ReadinessScoreService.SkillGap> gaps = scoreService.getSkillGaps(student.getId(), company.getId());
            
            Map<String, Object> item = new HashMap<>();
            item.put("companyId", company.getId());
            item.put("companyName", company.getName());
            item.put("role", company.getRole());
            item.put("minCgpa", company.getMinCgpa());
            item.put("matchPercent", match);
            item.put("gaps", gaps);
            item.put("description", company.getDescription());
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/scores")
    public ResponseEntity<?> getReadinessScores(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        Long studentId = student.getId();

        // Dynamically locate or seed core skills
        Skill softSkill = getOrSeedSkill("Soft Skills", SkillCategory.SOFT_SKILL);
        Skill aptitude = getOrSeedSkill("Quantitative Aptitude", SkillCategory.APTITUDE);
        Skill coding = getOrSeedSkill("Core Coding", SkillCategory.TECHNICAL);

        double softRating = scoreService.getCurrentSkillRating(studentId, softSkill.getId());
        double aptRating = scoreService.getCurrentSkillRating(studentId, aptitude.getId());
        double codeRating = scoreService.getCurrentSkillRating(studentId, coding.getId());

        // Projects Average rating
        List<SkillEvidence> evidences = evidenceRepo.findByStudentId(studentId);
        List<SkillEvidence> projects = evidences.stream()
                .filter(e -> e.getType() == EvidenceType.FACULTY_RATING && e.getDerivedRating() != null)
                .toList();
        double projectRating = projects.isEmpty() ? 0.0 : projects.stream().mapToDouble(SkillEvidence::getDerivedRating).average().orElse(0.0);

        // Certificates Average rating
        List<SkillEvidence> certs = evidences.stream()
                .filter(e -> e.getType() == EvidenceType.CERTIFICATE && e.getDerivedRating() != null)
                .toList();
        double certRating = certs.isEmpty() ? 0.0 : certs.stream().mapToDouble(SkillEvidence::getDerivedRating).average().orElse(0.0);

        double overallVal = Math.round(((softRating + aptRating + codeRating + projectRating + certRating) / 5.0) * 10.0) / 10.0;

        Map<String, Object> scores = new HashMap<>();
        scores.put("soft_skills", Math.round(softRating * 10.0) / 10.0);
        scores.put("aptitude", Math.round(aptRating * 10.0) / 10.0);
        scores.put("coding", Math.round(codeRating * 10.0) / 10.0);
        scores.put("projects", Math.round(projectRating * 10.0) / 10.0);
        scores.put("certificates", Math.round(certRating * 10.0) / 10.0);
        scores.put("overall_readiness", overallVal);

        return ResponseEntity.ok(scores);
    }

    @GetMapping("/tests/{type}")
    public ResponseEntity<?> getTestQuestions(@PathVariable String type) {
        // Mock static questions corresponding to assessments
        List<Map<String, Object>> questions = new ArrayList<>();
        if ("soft_skills".equalsIgnoreCase(type)) {
            questions.add(createMCQ(1, "What is the most effective way to handle team conflicts?", Arrays.asList("Ignore it", "Listen to both sides, find common ground", "Complain to admin", "Enforce your opinion")));
            questions.add(createMCQ(2, "Active listening involves:", Arrays.asList("Replying fast", "Repeating everything", "Fully concentrating, understanding and remembering", "Nodding without understanding")));
        } else if ("aptitude".equalsIgnoreCase(type)) {
            questions.add(createMCQ(1, "A train running at 60 km/h crosses a pole in 9s. What is its length in meters?", Arrays.asList("120m", "150m", "180m", "200m")));
            questions.add(createMCQ(2, "Find missing number: 2, 6, 12, 20, 30, ?, 56", Arrays.asList("36", "40", "42", "45")));
        } else {
            questions.add(createMCQ(1, "What is the worst-case search complexity in a balanced BST?", Arrays.asList("O(1)", "O(n)", "O(log n)", "O(n log n)")));
            questions.add(createMCQ(2, "Which SQL clause filters groups after GROUP BY?", Arrays.asList("WHERE", "HAVING", "ORDER BY", "SELECT")));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", type);
        response.put("questions", questions);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tests/{type}/submit")
    public ResponseEntity<?> submitTestAnswers(@AuthenticationPrincipal Jwt jwt,
                                               @PathVariable String type,
                                               @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");
        
        int score = 0;
        int maxScore = 2;
        List<Map<String, Object>> breakdown = new ArrayList<>();

        if ("soft_skills".equalsIgnoreCase(type)) {
            score += evaluateAnswer(answers, 1, 1, "Conflict resolution requires common ground.", breakdown, "What is the most effective way to handle team conflicts?", Arrays.asList("Ignore it", "Listen to both sides, find common ground", "Complain to admin", "Enforce your opinion"));
            score += evaluateAnswer(answers, 2, 2, "Active listening focuses on full engagement.", breakdown, "Active listening involves:", Arrays.asList("Replying fast", "Repeating everything", "Fully concentrating, understanding and remembering", "Nodding without understanding"));
        } else if ("aptitude".equalsIgnoreCase(type)) {
            score += evaluateAnswer(answers, 1, 1, "Speed (m/s) = 60 * 5/18 = 50/3. Length = (50/3) * 9 = 150m.", breakdown, "A train running at 60 km/h crosses a pole in 9s. What is its length in meters?", Arrays.asList("120m", "150m", "180m", "200m"));
            score += evaluateAnswer(answers, 2, 2, "Differences grow by +4, +6, +8, +10, +12. 30 + 12 = 42.", breakdown, "Find missing number: 2, 6, 12, 20, 30, ?, 56", Arrays.asList("36", "40", "42", "45"));
        } else {
            score += evaluateAnswer(answers, 1, 2, "A balanced tree has height log n.", breakdown, "What is the worst-case search complexity in a balanced BST?", Arrays.asList("O(1)", "O(n)", "O(log n)", "O(n log n)"));
            score += evaluateAnswer(answers, 2, 1, "HAVING filters groups.", breakdown, "Which SQL clause filters groups after GROUP BY?", Arrays.asList("WHERE", "HAVING", "ORDER BY", "SELECT"));
        }

        double rating = Math.max(1.0, Math.round(((double) score / maxScore) * 5.0 * 10.0) / 10.0);

        // Save rating to database
        String skillName = "Soft Skills";
        SkillCategory category = SkillCategory.SOFT_SKILL;
        if ("aptitude".equalsIgnoreCase(type)) {
            skillName = "Quantitative Aptitude";
            category = SkillCategory.APTITUDE;
        } else if ("coding".equalsIgnoreCase(type)) {
            skillName = "Core Coding";
            category = SkillCategory.TECHNICAL;
        }

        Skill skill = getOrSeedSkill(skillName, category);
        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType(EvidenceType.MOCK_TEST);
        evidence.setRawScore((double) score);
        evidence.setDerivedRating(rating);
        evidence.setComment("Initial " + type + " assessment evaluation.");
        evidence.setCreatedAt(LocalDateTime.now());
        evidenceRepo.save(evidence);

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("max_score", maxScore);
        result.put("rating", rating);
        result.put("breakdown", breakdown);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/evidence/upload")
    public ResponseEntity<?> uploadEvidence(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String type = (String) body.get("type"); // "project" or "certificate"
        String extraLink = (String) body.get("link");
        String comments = (String) body.get("comments");

        Skill skill = getOrSeedSkill(type.toUpperCase() + " Review", SkillCategory.TECHNICAL);
        SkillEvidence evidence = new SkillEvidence();
        evidence.setStudent(student);
        evidence.setSkill(skill);
        evidence.setType("project".equalsIgnoreCase(type) ? EvidenceType.FACULTY_RATING : EvidenceType.CERTIFICATE);
        evidence.setRawScore(0.0);
        evidence.setDerivedRating(null); // Pending review
        evidence.setComment(title + "||" + description + "||" + extraLink + "||" + comments);
        evidence.setCreatedAt(LocalDateTime.now());
        evidenceRepo.save(evidence);

        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/evidence")
    public ResponseEntity<?> getEvidences(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        List<SkillEvidence> list = evidenceRepo.findByStudentId(student.getId());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (SkillEvidence e : list) {
            if (e.getType() == EvidenceType.FACULTY_RATING || e.getType() == EvidenceType.CERTIFICATE) {
                String[] parts = e.getComment().split("\\|\\|");
                Map<String, Object> item = new HashMap<>();
                item.put("id", e.getId());
                item.put("title", parts.length > 0 ? parts[0] : "Unnamed Upload");
                item.put("description", parts.length > 1 ? parts[1] : "");
                item.put("link", parts.length > 2 ? parts[2] : "");
                item.put("comments", parts.length > 3 ? parts[3] : "");
                item.put("type", e.getType() == EvidenceType.FACULTY_RATING ? "project" : "certificate");
                item.put("rating", e.getDerivedRating());
                item.put("uploaded_at", e.getCreatedAt());
                result.add(item);
            }
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResumeFile(@AuthenticationPrincipal Jwt jwt, @RequestParam("file") MultipartFile file) {
        User student = getAuthenticatedUser(jwt);
        String parsedText = resumeService.parseResumeFile(file);
        Map<String, Object> analysis = resumeService.analyzeResume(student, parsedText, null);
        
        Map<String, Object> response = new HashMap<>(analysis);
        response.put("resumeText", parsedText);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resume/analyze")
    public ResponseEntity<?> analyzeResume(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        String resumeText = (String) body.get("resumeText");
        Long targetCompanyId = body.get("targetCompanyId") != null ? Long.valueOf(body.get("targetCompanyId").toString()) : null;

        Map<String, Object> res = resumeService.analyzeResume(student, resumeText, targetCompanyId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/resume")
    public ResponseEntity<?> getResume(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        Resume resume = resumeService.getResumeByStudent(student.getId());
        if (resume == null) {
            return ResponseEntity.ok(null);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("resumeText", resume.getResumeText());
        res.put("atsScore", resume.getAtsScore());
        res.put("critique", Arrays.asList(resume.getCritique().split("\\|\\|")));
        res.put("uploaded_at", resume.getCreatedAt());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/resume/generate")
    public ResponseEntity<?> generateResumeFromProfile(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        
        StudentProfile profile = profileRepo.findByUserId(student.getId())
                .orElseThrow(() -> new RuntimeException("Please complete your profile details first."));
        List<StudentSkill> skills = studentSkillRepo.findByStudentId(student.getId());
        List<StudentProject> projects = projectRepo.findByStudentId(student.getId());
        List<StudentCertificate> certs = certificateRepo.findByStudentId(student.getId());

        String text = resumeService.generateResumeText(student, profile, skills, projects, certs);
        
        resumeService.analyzeResume(student, text, null);

        Map<String, Object> res = new HashMap<>();
        res.put("resumeText", text);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/resume/tailor")
    public ResponseEntity<?> tailorResumeForCompany(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        Long companyId = Long.valueOf(body.get("targetCompanyId").toString());
        
        Resume currentResume = resumeService.getResumeByStudent(student.getId());
        String currentText = "";
        if (currentResume != null) {
            currentText = currentResume.getResumeText();
        } else {
            StudentProfile profile = profileRepo.findByUserId(student.getId())
                    .orElseThrow(() -> new RuntimeException("Please complete your profile details first."));
            List<StudentSkill> skills = studentSkillRepo.findByStudentId(student.getId());
            List<StudentProject> projects = projectRepo.findByStudentId(student.getId());
            List<StudentCertificate> certs = certificateRepo.findByStudentId(student.getId());
            currentText = resumeService.generateResumeText(student, profile, skills, projects, certs);
        }

        String tailoredText = resumeService.tailorResume(currentText, companyId);
        
        Map<String, Object> analysis = resumeService.analyzeResume(student, tailoredText, companyId);

        Map<String, Object> res = new HashMap<>(analysis);
        res.put("resumeText", tailoredText);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/resume/download")
    public ResponseEntity<byte[]> downloadResumePdf(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        Resume resume = resumeService.getResumeByStudent(student.getId());
        if (resume == null) {
            throw new RuntimeException("No resume found to download. Please upload or generate one first.");
        }

        byte[] pdfBytes = resumeService.generateResumePdf(resume.getResumeText());

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume.pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // Helper to get or seed a skill
    private Skill getOrSeedSkill(String name, SkillCategory cat) {
        return skillRepo.findByName(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory(cat);
                    return skillRepo.save(s);
                });
    }

    private Map<String, Object> createMCQ(int id, String text, List<String> options) {
        Map<String, Object> q = new HashMap<>();
        q.put("id", id);
        q.put("question", text);
        q.put("options", options);
        return q;
    }

    private int evaluateAnswer(List<Map<String, Object>> answers, int id, int correctIdx, String expl, List<Map<String, Object>> breakdown, String questionText, List<String> options) {
        if (answers == null) return 0;
        Optional<Map<String, Object>> match = answers.stream().filter(a -> Integer.parseInt(a.get("id").toString()) == id).findFirst();
        
        int selected = -1;
        if (match.isPresent() && match.get().get("selected") != null) {
            selected = Integer.parseInt(match.get().get("selected").toString());
        }

        boolean isCorrect = (selected == correctIdx);
        Map<String, Object> review = new HashMap<>();
        review.put("questionId", id);
        review.put("questionText", questionText);
        review.put("selectedOption", selected >= 0 ? options.get(selected) : "Unanswered");
        review.put("correctOption", options.get(correctIdx));
        review.put("isCorrect", isCorrect);
        review.put("explanation", expl);
        breakdown.add(review);

        return isCorrect ? 1 : 0;
    }
}