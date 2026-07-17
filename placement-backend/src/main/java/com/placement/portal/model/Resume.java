package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
public class Resume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", unique = true, nullable = false)
    private User student;

    @Column(columnDefinition = "TEXT")
    private String resumeText;

    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String critique; // Comma-separated or JSON list of critiques

    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Resume() {}

    public Resume(User student, String resumeText, Integer atsScore, String critique) {
        this.student = student;
        this.resumeText = resumeText;
        this.atsScore = atsScore;
        this.critique = critique;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public String getCritique() { return critique; }
    public void setCritique(String critique) { this.critique = critique; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
