package com.placement.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = true)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = true)
    private Skill skill;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String options; // Comma-separated options, e.g., "INNER JOIN,RIGHT JOIN,LEFT JOIN,FULL JOIN"

    private Integer answer; // Index of correct option (0-indexed)

    // Constructors
    public QuizQuestion() {}

    public QuizQuestion(Course course, String question, String options, Integer answer) {
        this.course = course;
        this.question = question;
        this.options = options;
        this.answer = answer;
    }

    public QuizQuestion(Skill skill, String question, String options, Integer answer) {
        this.skill = skill;
        this.question = question;
        this.options = options;
        this.answer = answer;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }

    public Integer getAnswer() { return answer; }
    public void setAnswer(Integer answer) { this.answer = answer; }
}
