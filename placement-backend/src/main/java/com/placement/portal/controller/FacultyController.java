package com.placement.portal.controller;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import com.placement.portal.service.ReadinessScoreService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final SkillEvidenceRepository evidenceRepo;
    private final CourseRepository courseRepo;
    private final CompanyRepository companyRepo;
    private final CompanyRequirementRepository requirementRepo;
    private final StudentCourseProgressRepository progressRepo;
    private final ResumeRepository resumeRepo;
    private final MaterialRepository materialRepo;
    private final ReadinessScoreService scoreService;
    private final StudentProjectRepository projectRepo;
    private final StudentCertificateRepository certificateRepo;
    private final StudentSkillRepository studentSkillRepo;
    private final StudentProfileRepository profileRepo;

    public FacultyController(UserRepository userRepo,
                             SkillRepository skillRepo,
                             SkillEvidenceRepository evidenceRepo,
                             CourseRepository courseRepo,
                             CompanyRepository companyRepo,
                             CompanyRequirementRepository requirementRepo,
                             StudentCourseProgressRepository progressRepo,
                             ResumeRepository resumeRepo,
                             MaterialRepository materialRepo,
                             ReadinessScoreService scoreService,
                             StudentProjectRepository projectRepo,
                             StudentCertificateRepository certificateRepo,
                             StudentSkillRepository studentSkillRepo,
                             StudentProfileRepository profileRepo) {
        this.userRepo = userRepo;
        this.skillRepo = skillRepo;
        this.evidenceRepo = evidenceRepo;
        this.courseRepo = courseRepo;
        this.companyRepo = companyRepo;
        this.requirementRepo = requirementRepo;
        this.progressRepo = progressRepo;
        this.resumeRepo = resumeRepo;
        this.materialRepo = materialRepo;
        this.scoreService = scoreService;
        this.projectRepo = projectRepo;
        this.certificateRepo = certificateRepo;
        this.studentSkillRepo = studentSkillRepo;
        this.profileRepo = profileRepo;
    }

    private User getAuthenticatedUser(Jwt jwt) {
        String email = jwt.getSubject();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty user not found."));
    }

    @GetMapping("/students")
    public ResponseEntity<?> listStudentTracking(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt); // Check permissions
        
        List<User> students = userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .toList();

        List<Company> companies = companyRepo.findAll();
        Skill softSkill = getOrSeedSkill("Soft Skills", SkillCategory.SOFT_SKILL);
        Skill aptitude = getOrSeedSkill("Quantitative Aptitude", SkillCategory.APTITUDE);
        Skill coding = getOrSeedSkill("Core Coding", SkillCategory.TECHNICAL);

        List<Map<String, Object>> trackingData = new ArrayList<>();

        for (User student : students) {
            Long studentId = student.getId();

            double soft = scoreService.getCurrentSkillRating(studentId, softSkill.getId());
            double apt = scoreService.getCurrentSkillRating(studentId, aptitude.getId());
            double code = scoreService.getCurrentSkillRating(studentId, coding.getId());

            List<SkillEvidence> allEvidences = evidenceRepo.findByStudentId(studentId);

            // Graded projects average
            List<SkillEvidence> projects = allEvidences.stream()
                    .filter(e -> e.getType() == EvidenceType.FACULTY_RATING && e.getDerivedRating() != null)
                    .toList();
            double projectRating = projects.isEmpty() ? 0.0 : projects.stream().mapToDouble(SkillEvidence::getDerivedRating).average().orElse(0.0);

            // Graded certificates average
            List<SkillEvidence> certs = allEvidences.stream()
                    .filter(e -> e.getType() == EvidenceType.CERTIFICATE && e.getDerivedRating() != null)
                    .toList();
            double certRating = certs.isEmpty() ? 0.0 : certs.stream().mapToDouble(SkillEvidence::getDerivedRating).average().orElse(0.0);

            double overallReadiness = Math.round(((soft + apt + code + projectRating + certRating) / 5.0) * 10.0) / 10.0;

            // Badges
            List<StudentCourseProgress> progress = progressRepo.findByStudentId(studentId);
            List<String> badges = progress.stream()
                    .filter(StudentCourseProgress::getBadgeEarned)
                    .map(p -> p.getCourse().getBadgeName())
                    .toList();

            // Mock tests
            List<Map<String, Object>> mockTests = allEvidences.stream()
                    .filter(e -> e.getType() == EvidenceType.MOCK_TEST)
                    .map(e -> {
                        Map<String, Object> mockItem = new HashMap<>();
                        mockItem.put("company_name", e.getComment().contains("drive") ? e.getComment().replace("Completed mock test for ", "").replace(" placement drive.", "") : "General");
                        mockItem.put("score", e.getRawScore().intValue());
                        mockItem.put("taken_at", e.getCreatedAt());
                        return mockItem;
                    }).toList();

            // Resume ATS
            Resume resume = resumeRepo.findByStudentId(studentId).orElse(null);
            Integer resumeAts = resume != null ? resume.getAtsScore() : null;

            // Gaps
            List<Map<String, Object>> gaps = new ArrayList<>();
            for (Company c : companies) {
                List<ReadinessScoreService.SkillGap> companyGaps = scoreService.getSkillGaps(studentId, c.getId());
                if (!companyGaps.isEmpty()) {
                    Map<String, Object> gapItem = new HashMap<>();
                    gapItem.put("company", c.getName());
                    gapItem.put("role", c.getRole());
                    gapItem.put("missingSkills", companyGaps.stream().map(ReadinessScoreService.SkillGap::getSkillName).toList());
                    gaps.add(gapItem);
                }
            }

            Map<String, Object> row = new HashMap<>();
            row.put("id", studentId);
            row.put("name", student.getFullName() != null ? student.getFullName() : student.getEmail().split("@")[0]);
            row.put("email", student.getEmail());
            row.put("profile", profileRepo.findByUserId(studentId).orElse(null));
            
            Map<String, Double> scores = new HashMap<>();
            scores.put("soft", Math.round(soft*10.0)/10.0);
            scores.put("aptitude", Math.round(apt*10.0)/10.0);
            scores.put("coding", Math.round(code*10.0)/10.0);
            scores.put("projects", Math.round(projectRating*10.0)/10.0);
            scores.put("certificates", Math.round(certRating*10.0)/10.0);
            row.put("scores", scores);
            
            row.put("overall_readiness", overallReadiness);
            row.put("badges", badges);
            row.put("mock_tests", mockTests);
            row.put("resume_ats", resumeAts);
            row.put("skill_gaps", gaps);

            trackingData.add(row);
        }

        return ResponseEntity.ok(trackingData);
    }

    @GetMapping("/evidence/pending")
    public ResponseEntity<?> pendingReviews(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt);

        List<SkillEvidence> pendings = evidenceRepo.findByDerivedRatingIsNull();
        List<Map<String, Object>> result = new ArrayList<>();

        for (SkillEvidence e : pendings) {
            if (e.getType() == EvidenceType.FACULTY_RATING || e.getType() == EvidenceType.CERTIFICATE) {
                String[] parts = e.getComment().split("\\|\\|");
                Map<String, Object> item = new HashMap<>();
                item.put("id", e.getId());
                item.put("student_name", e.getStudent().getFullName() != null ? e.getStudent().getFullName() : e.getStudent().getEmail().split("@")[0]);
                item.put("student_email", e.getStudent().getEmail());
                item.put("title", parts.length > 0 ? parts[0] : "Unnamed Upload");
                item.put("description", parts.length > 1 ? parts[1] : "");
                item.put("link", parts.length > 2 ? parts[2] : "");
                item.put("comments", parts.length > 3 ? parts[3] : "");
                item.put("type", e.getType() == EvidenceType.FACULTY_RATING ? "project" : "certificate");
                item.put("uploaded_at", e.getCreatedAt());
                result.add(item);
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/evidence/{id}/review")
    public ResponseEntity<?> gradeEvidence(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        getAuthenticatedUser(jwt);
        Double rating = Double.valueOf(body.get("rating").toString());
        String feedback = (String) body.get("feedback");

        SkillEvidence evidence = evidenceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Evidence upload not found."));

        evidence.setDerivedRating(rating);
        // Append feedback to comment string
        String currentComment = evidence.getComment();
        evidence.setComment(currentComment + "||" + feedback);
        evidenceRepo.save(evidence);

        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/projects/pending")
    public ResponseEntity<?> getPendingProjects(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt);
        return ResponseEntity.ok(projectRepo.findByRatingIsNull());
    }

    @PostMapping("/projects/{id}/review")
    public ResponseEntity<?> reviewProject(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        getAuthenticatedUser(jwt);
        Double rating = Double.valueOf(body.get("rating").toString());
        String feedback = (String) body.get("feedback");

        StudentProject project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found."));
        project.setRating(rating);
        project.setFeedback(feedback);
        projectRepo.save(project);

        // Sync with SkillEvidence
        List<SkillEvidence> evidences = evidenceRepo.findByStudentId(project.getStudent().getId());
        for (SkillEvidence e : evidences) {
            if (e.getType() == EvidenceType.FACULTY_RATING && e.getComment() != null && e.getComment().endsWith("||" + id)) {
                e.setDerivedRating(rating);
                e.setComment(e.getComment() + "||" + feedback);
                evidenceRepo.save(e);
                break;
            }
        }

        return ResponseEntity.ok(project);
    }

    @GetMapping("/certificates/pending")
    public ResponseEntity<?> getPendingCertificates(@AuthenticationPrincipal Jwt jwt) {
        getAuthenticatedUser(jwt);
        return ResponseEntity.ok(certificateRepo.findByStatus("PENDING"));
    }

    @PostMapping("/certificates/{id}/review")
    public ResponseEntity<?> reviewCertificate(@AuthenticationPrincipal Jwt jwt,
                                               @PathVariable Long id,
                                               @RequestBody Map<String, Object> body) {
        getAuthenticatedUser(jwt);
        String status = (String) body.get("status"); // APPROVED or REJECTED
        Double rating = body.get("rating") != null ? Double.valueOf(body.get("rating").toString()) : null;
        String feedback = (String) body.get("feedback");

        StudentCertificate certificate = certificateRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found."));
        certificate.setStatus(status);
        certificate.setRating(rating);
        certificate.setFeedback(feedback);
        certificateRepo.save(certificate);

        // If linked to a skill, update StudentSkill too!
        if (certificate.getSkill() != null) {
            Optional<StudentSkill> ssOpt = studentSkillRepo.findByStudentIdAndSkillId(
                    certificate.getStudent().getId(), certificate.getSkill().getId());
            if (ssOpt.isPresent()) {
                StudentSkill ss = ssOpt.get();
                ss.setCertificateStatus(status);
                ss.setCertificateFeedback(feedback);
                if ("APPROVED".equalsIgnoreCase(status) && rating != null) {
                    ss.setRating(rating);
                }
                studentSkillRepo.save(ss);
            }
        }

        // Sync with SkillEvidence
        List<SkillEvidence> evidences = evidenceRepo.findByStudentId(certificate.getStudent().getId());
        for (SkillEvidence e : evidences) {
            if (e.getType() == EvidenceType.CERTIFICATE && e.getComment() != null && e.getComment().endsWith("||" + id)) {
                e.setDerivedRating(rating);
                e.setComment(e.getComment() + "||" + feedback);
                evidenceRepo.save(e);
                break;
            }
        }

        return ResponseEntity.ok(certificate);
    }

    @PostMapping("/materials")
    public ResponseEntity<?> addMaterials(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        User faculty = getAuthenticatedUser(jwt);
        String title = (String) body.get("title");
        String courseId = (String) body.get("course_id");
        Long companyId = body.get("company_id") != null ? Long.valueOf(body.get("company_id").toString()) : null;
        String type = (String) body.get("type"); // "link" or "text"
        String urlOrContent = (String) body.get("url_or_content");

        Course course = null;
        if (courseId != null && !courseId.isEmpty()) {
            course = courseRepo.findById(courseId).orElse(null);
        }
        Company company = null;
        if (companyId != null) {
            company = companyRepo.findById(companyId).orElse(null);
        }

        Material m = new Material(title, course, company, type, urlOrContent, faculty);
        materialRepo.save(m);

        return ResponseEntity.ok(m);
    }

    @GetMapping("/materials")
    public ResponseEntity<?> getMaterials() {
        return ResponseEntity.ok(materialRepo.findAll());
    }

    private Skill getOrSeedSkill(String name, SkillCategory cat) {
        return skillRepo.findByName(name)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setCategory(cat);
                    return skillRepo.save(s);
                });
    }
}
