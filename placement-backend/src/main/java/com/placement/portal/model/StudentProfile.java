package com.placement.portal.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private String profilePhotoPath;
    private String phone;
    private String gender;
    private LocalDate dob;
    private String relocationCities;
    
    @Column(length = 1000)
    private String temporaryAddress;

    // Documents status
    private String aadharNumber;
    private String passportNumber;
    private String panCardNumber;

    // Parents/Guardian Info
    private String parentName;
    private String parentPhone;
    private String parentRelation;

    // Education General
    private String highestDegree;
    private Integer highestYop;

    // 10th / SSLC
    private Double sslcPercentage;
    private Integer sslcYop;

    // PUC / 12th
    private Double pucPercentage;
    private Integer pucYop;
    private String pucYearGap;

    // Degree details
    private Double degreeCgpa;
    private Integer degreeYop;
    private String degreeName;
    private String degreeStream;
    private String degreeCollege;
    private String degreeUniversity;
    private String degreeYearGap;

    // PG details (started PG, e.g., MCA)
    private Boolean hasPg = false;
    private String pgDegree;
    private String pgStream;
    private String pgCollege;
    private String pgUniversity;
    private Integer pgYop;
    private String pgYearGap;
    
    // Sem-wise CGPA
    private Double pgSem1Cgpa;
    private Double pgSem2Cgpa;
    private Double pgSem3Cgpa;
    private Double pgSem4Cgpa;
    private Double pgSem5Cgpa;
    private Double pgSem6Cgpa;

    // Constructors
    public StudentProfile() {}

    public StudentProfile(User user) {
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getProfilePhotoPath() { return profilePhotoPath; }
    public void setProfilePhotoPath(String profilePhotoPath) { this.profilePhotoPath = profilePhotoPath; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getRelocationCities() { return relocationCities; }
    public void setRelocationCities(String relocationCities) { this.relocationCities = relocationCities; }

    public String getTemporaryAddress() { return temporaryAddress; }
    public void setTemporaryAddress(String temporaryAddress) { this.temporaryAddress = temporaryAddress; }

    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public String getPanCardNumber() { return panCardNumber; }
    public void setPanCardNumber(String panCardNumber) { this.panCardNumber = panCardNumber; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    public String getParentRelation() { return parentRelation; }
    public void setParentRelation(String parentRelation) { this.parentRelation = parentRelation; }

    public String getHighestDegree() { return highestDegree; }
    public void setHighestDegree(String highestDegree) { this.highestDegree = highestDegree; }

    public Integer getHighestYop() { return highestYop; }
    public void setHighestYop(Integer highestYop) { this.highestYop = highestYop; }

    public Double getSslcPercentage() { return sslcPercentage; }
    public void setSslcPercentage(Double sslcPercentage) { this.sslcPercentage = sslcPercentage; }

    public Integer getSslcYop() { return sslcYop; }
    public void setSslcYop(Integer sslcYop) { this.sslcYop = sslcYop; }

    public Double getPucPercentage() { return pucPercentage; }
    public void setPucPercentage(Double pucPercentage) { this.pucPercentage = pucPercentage; }

    public Integer getPucYop() { return pucYop; }
    public void setPucYop(Integer pucYop) { this.pucYop = pucYop; }

    public String getPucYearGap() { return pucYearGap; }
    public void setPucYearGap(String pucYearGap) { this.pucYearGap = pucYearGap; }

    public Double getDegreeCgpa() { return degreeCgpa; }
    public void setDegreeCgpa(Double degreeCgpa) { this.degreeCgpa = degreeCgpa; }

    public Integer getDegreeYop() { return degreeYop; }
    public void setDegreeYop(Integer degreeYop) { this.degreeYop = degreeYop; }

    public String getDegreeName() { return degreeName; }
    public void setDegreeName(String degreeName) { this.degreeName = degreeName; }

    public String getDegreeStream() { return degreeStream; }
    public void setDegreeStream(String degreeStream) { this.degreeStream = degreeStream; }

    public String getDegreeCollege() { return degreeCollege; }
    public void setDegreeCollege(String degreeCollege) { this.degreeCollege = degreeCollege; }

    public String getDegreeUniversity() { return degreeUniversity; }
    public void setDegreeUniversity(String degreeUniversity) { this.degreeUniversity = degreeUniversity; }

    public String getDegreeYearGap() { return degreeYearGap; }
    public void setDegreeYearGap(String degreeYearGap) { this.degreeYearGap = degreeYearGap; }

    public Boolean getHasPg() { return hasPg; }
    public void setHasPg(Boolean hasPg) { this.hasPg = hasPg; }

    public String getPgDegree() { return pgDegree; }
    public void setPgDegree(String pgDegree) { this.pgDegree = pgDegree; }

    public String getPgStream() { return pgStream; }
    public void setPgStream(String pgStream) { this.pgStream = pgStream; }

    public String getPgCollege() { return pgCollege; }
    public void setPgCollege(String pgCollege) { this.pgCollege = pgCollege; }

    public String getPgUniversity() { return pgUniversity; }
    public void setPgUniversity(String pgUniversity) { this.pgUniversity = pgUniversity; }

    public Integer getPgYop() { return pgYop; }
    public void setPgYop(Integer pgYop) { this.pgYop = pgYop; }

    public String getPgYearGap() { return pgYearGap; }
    public void setPgYearGap(String pgYearGap) { this.pgYearGap = pgYearGap; }

    public Double getPgSem1Cgpa() { return pgSem1Cgpa; }
    public void setPgSem1Cgpa(Double pgSem1Cgpa) { this.pgSem1Cgpa = pgSem1Cgpa; }

    public Double getPgSem2Cgpa() { return pgSem2Cgpa; }
    public void setPgSem2Cgpa(Double pgSem2Cgpa) { this.pgSem2Cgpa = pgSem2Cgpa; }

    public Double getPgSem3Cgpa() { return pgSem3Cgpa; }
    public void setPgSem3Cgpa(Double pgSem3Cgpa) { this.pgSem3Cgpa = pgSem3Cgpa; }

    public Double getPgSem4Cgpa() { return pgSem4Cgpa; }
    public void setPgSem4Cgpa(Double pgSem4Cgpa) { this.pgSem4Cgpa = pgSem4Cgpa; }

    public Double getPgSem5Cgpa() { return pgSem5Cgpa; }
    public void setPgSem5Cgpa(Double pgSem5Cgpa) { this.pgSem5Cgpa = pgSem5Cgpa; }

    public Double getPgSem6Cgpa() { return pgSem6Cgpa; }
    public void setPgSem6Cgpa(Double pgSem6Cgpa) { this.pgSem6Cgpa = pgSem6Cgpa; }
}
