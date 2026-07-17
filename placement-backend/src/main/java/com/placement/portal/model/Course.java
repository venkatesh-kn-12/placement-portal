package com.placement.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    private String id; // e.g., "sql_dev"
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String badgeName;
    private String badgeIcon;

    private String category; // e.g., "Programming Languages", "Soft Skills", "Aptitude", "Company Oriented"

    // Default constructor
    public Course() {}

    public Course(String id, String title, String description, String badgeName, String badgeIcon, String category) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.badgeName = badgeName;
        this.badgeIcon = badgeIcon;
        this.category = category;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public String getBadgeIcon() { return badgeIcon; }
    public void setBadgeIcon(String badgeIcon) { this.badgeIcon = badgeIcon; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
