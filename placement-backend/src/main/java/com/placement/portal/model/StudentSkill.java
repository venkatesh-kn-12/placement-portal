package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_skills")
public class StudentSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String level; // BEGINNER, INTERMEDIATE, EXPERT

    private Double rating; // Derived from mock test

    private String certificateFilePath;
    private String certificateStatus; // PENDING, APPROVED, REJECTED
    
    @Column(length = 1000)
    private String certificateFeedback;

    private LocalDateTime createdAt = LocalDateTime.now();

    public StudentSkill() {}

    public StudentSkill(User student, Skill skill, String level) {
        this.student = student;
        this.skill = skill;
        this.level = level;
        this.certificateStatus = "PENDING";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getCertificateFilePath() { return certificateFilePath; }
    public void setCertificateFilePath(String certificateFilePath) { this.certificateFilePath = certificateFilePath; }

    public String getCertificateStatus() { return certificateStatus; }
    public void setCertificateStatus(String certificateStatus) { this.certificateStatus = certificateStatus; }

    public String getCertificateFeedback() { return certificateFeedback; }
    public void setCertificateFeedback(String certificateFeedback) { this.certificateFeedback = certificateFeedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
