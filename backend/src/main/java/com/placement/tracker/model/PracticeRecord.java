package com.placement.tracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "practice_records")
public class PracticeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer problemsSolved;
    
    @Column(nullable = false)
    private String topic;
    
    @Column(nullable = false)
    private LocalDate practiceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public PracticeRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(Integer problemsSolved) { this.problemsSolved = problemsSolved; }
    
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public LocalDate getPracticeDate() { return practiceDate; }
    public void setPracticeDate(LocalDate practiceDate) { this.practiceDate = practiceDate; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
