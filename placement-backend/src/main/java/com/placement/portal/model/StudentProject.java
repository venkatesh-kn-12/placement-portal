package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_projects")
public class StudentProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private String gitLink;
    private String hostedLink;
    
    private String documentPath; // path to PDF/Doc
    private String diagramPath;  // path to diagram image

    private Double rating; // Faculty rating (1 to 5)
    
    @Column(columnDefinition = "TEXT")
    private String feedback; // Faculty feedback

    private LocalDateTime createdAt = LocalDateTime.now();

    public StudentProject() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGitLink() { return gitLink; }
    public void setGitLink(String gitLink) { this.gitLink = gitLink; }

    public String getHostedLink() { return hostedLink; }
    public void setHostedLink(String hostedLink) { this.hostedLink = hostedLink; }

    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }

    public String getDiagramPath() { return diagramPath; }
    public void setDiagramPath(String diagramPath) { this.diagramPath = diagramPath; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
