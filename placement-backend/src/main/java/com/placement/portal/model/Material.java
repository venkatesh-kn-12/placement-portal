package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course; // Nullable, if it is specific to a company drive instead

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company; // Nullable, if it is generic course study material

    private String type; // "link" or "text"

    @Column(columnDefinition = "TEXT")
    private String urlOrContent;

    @ManyToOne
    @JoinColumn(name = "added_by_id", nullable = false)
    private User addedBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Material() {}

    public Material(String title, Course course, Company company, String type, String urlOrContent, User addedBy) {
        this.title = title;
        this.course = course;
        this.company = company;
        this.type = type;
        this.urlOrContent = urlOrContent;
        this.addedBy = addedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUrlOrContent() { return urlOrContent; }
    public void setUrlOrContent(String urlOrContent) { this.urlOrContent = urlOrContent; }

    public User getAddedBy() { return addedBy; }
    public void setAddedBy(User addedBy) { this.addedBy = addedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
