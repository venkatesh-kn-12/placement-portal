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
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepo;
    private final LessonRepository lessonRepo;
    private final QuizQuestionRepository quizRepo;
    private final StudentCourseProgressRepository progressRepo;
    private final UserRepository userRepo;
    private final SkillRepository skillRepo;
    private final SkillEvidenceRepository evidenceRepo;

    public CourseController(CourseRepository courseRepo,
                            LessonRepository lessonRepo,
                            QuizQuestionRepository quizRepo,
                            StudentCourseProgressRepository progressRepo,
                            UserRepository userRepo,
                            SkillRepository skillRepo,
                            SkillEvidenceRepository evidenceRepo) {
        this.courseRepo = courseRepo;
        this.lessonRepo = lessonRepo;
        this.quizRepo = quizRepo;
        this.progressRepo = progressRepo;
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
    public ResponseEntity<?> listCourses() {
        return ResponseEntity.ok(courseRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable String id) {
        Course course = courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        List<Lesson> lessons = lessonRepo.findByCourseId(id);
        List<QuizQuestion> quiz = quizRepo.findByCourseId(id);

        Map<String, Object> res = new HashMap<>();
        res.put("id", course.getId());
        res.put("title", course.getTitle());
        res.put("description", course.getDescription());
        res.put("badge_name", course.getBadgeName());
        res.put("badge_icon", course.getBadgeIcon());
        res.put("category", course.getCategory());
        res.put("lessons", lessons);
        
        // Hide correct answer indexes from the client
        List<Map<String, Object>> clientQuiz = quiz.stream().map(q -> {
            Map<String, Object> questionItem = new HashMap<>();
            questionItem.put("id", q.getId());
            questionItem.put("question", q.getQuestion());
            questionItem.put("options", Arrays.asList(q.getOptions().split(",")));
            return questionItem;
        }).toList();

        res.put("quiz", clientQuiz);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getCourseProgress(@AuthenticationPrincipal Jwt jwt) {
        User student = getAuthenticatedUser(jwt);
        List<StudentCourseProgress> progress = progressRepo.findByStudentId(student.getId());
        
        List<Map<String, Object>> clientProgress = progress.stream().map(p -> {
            Map<String, Object> item = new HashMap<>();
            item.put("course_id", p.getCourse().getId());
            item.put("lessons_completed", Arrays.stream(p.getLessonsCompleted().split(","))
                    .filter(s -> !s.isEmpty()).toList());
            item.put("quiz_completed", p.getQuizCompleted());
            item.put("badge_earned", p.getBadgeEarned());
            item.put("score", p.getScore());
            item.put("completed_at", p.getCompletedAt());
            return item;
        }).toList();
        
        return ResponseEntity.ok(clientProgress);
    }

    @PostMapping("/{id}/lesson")
    public ResponseEntity<?> completeLesson(@AuthenticationPrincipal Jwt jwt,
                                            @PathVariable String id,
                                            @RequestBody Map<String, String> body) {
        User student = getAuthenticatedUser(jwt);
        String lessonId = body.get("lessonId");
        
        Course course = courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        StudentCourseProgress progress = progressRepo.findByStudentIdAndCourseId(student.getId(), id)
                .orElseGet(() -> {
                    StudentCourseProgress p = new StudentCourseProgress(student, course);
                    return progressRepo.save(p);
                });

        Set<String> completed = new HashSet<>(Arrays.asList(progress.getLessonsCompleted().split(",")));
        completed.add(lessonId);
        // Remove empty strings
        completed.remove("");

        progress.setLessonsCompleted(String.join(",", completed));
        progressRepo.save(progress);

        return ResponseEntity.ok(progress);
    }

    @PostMapping("/{id}/quiz")
    public ResponseEntity<?> submitQuiz(@AuthenticationPrincipal Jwt jwt,
                                        @PathVariable String id,
                                        @RequestBody Map<String, Object> body) {
        User student = getAuthenticatedUser(jwt);
        List<Integer> answers = (List<Integer>) body.get("answers");

        Course course = courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        List<QuizQuestion> questions = quizRepo.findByCourseId(id);

        int correct = 0;
        for (int i = 0; i < Math.min(answers.size(), questions.size()); i++) {
            if (answers.get(i).equals(questions.get(i).getAnswer())) {
                correct++;
            }
        }

        int percentage = Math.round(((float) correct / questions.size()) * 100);
        boolean passed = percentage >= 70;

        StudentCourseProgress progress = progressRepo.findByStudentIdAndCourseId(student.getId(), id)
                .orElseGet(() -> new StudentCourseProgress(student, course));

        progress.setQuizCompleted(true);
        progress.setScore(percentage);

        if (passed) {
            progress.setBadgeEarned(true);
            progress.setCompletedAt(LocalDateTime.now());
            
            // Automatically insert a verified technical SkillEvidence of type ASSIGNMENT for this skill!
            String skillName = course.getTitle().contains("SQL") ? "SQL" : "DSA";
            SkillCategory category = SkillCategory.TECHNICAL;
            Skill skill = skillRepo.findByName(skillName)
                    .orElseGet(() -> {
                        Skill s = new Skill();
                        s.setName(skillName);
                        s.setCategory(category);
                        return skillRepo.save(s);
                    });

            SkillEvidence evidence = new SkillEvidence();
            evidence.setStudent(student);
            evidence.setSkill(skill);
            evidence.setType(EvidenceType.ASSIGNMENT);
            evidence.setRawScore(100.0);
            evidence.setDerivedRating(5.0); // 5/5 stars for completing the course
            evidence.setComment("Unlocked " + course.getBadgeName() + " badge with " + percentage + "% score on final quiz.");
            evidence.setCreatedAt(LocalDateTime.now());
            evidenceRepo.save(evidence);
        }
        progressRepo.save(progress);

        Map<String, Object> res = new HashMap<>();
        res.put("passed", passed);
        res.put("score", percentage);
        res.put("correctCount", correct);
        res.put("total", questions.size());
        res.put("badge_earned", progress.getBadgeEarned());
        return ResponseEntity.ok(res);
    }
}
