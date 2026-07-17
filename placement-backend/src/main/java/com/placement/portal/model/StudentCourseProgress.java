package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_course_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class StudentCourseProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(columnDefinition = "TEXT")
    private String lessonsCompleted = ""; // Comma-separated lesson IDs, e.g., "sql_l1,sql_l2"

    private Boolean quizCompleted = false;
    private Boolean badgeEarned = false;
    private Integer score = 0; // percentage score

    private LocalDateTime completedAt;

    // Constructors
    public StudentCourseProgress() {}

    public StudentCourseProgress(User student, Course course) {
        this.student = student;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getLessonsCompleted() { return lessonsCompleted; }
    public void setLessonsCompleted(String lessonsCompleted) { this.lessonsCompleted = lessonsCompleted; }

    public Boolean getQuizCompleted() { return quizCompleted; }
    public void setQuizCompleted(Boolean quizCompleted) { this.quizCompleted = quizCompleted; }

    public Boolean getBadgeEarned() { return badgeEarned; }
    public void setBadgeEarned(Boolean badgeEarned) { this.badgeEarned = badgeEarned; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
