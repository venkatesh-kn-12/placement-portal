package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private LocalDate visitDate;
    private Double minCgpa;
    private String role;
    
    @Column(length = 2000)
    private String description;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
    
    public Double getMinCgpa() { return minCgpa; }
    public void setMinCgpa(Double minCgpa) { this.minCgpa = minCgpa; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}