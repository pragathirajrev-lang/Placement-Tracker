package com.placement.tracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;

    @Column(name = "target_goal")
    private String targetGoal;

    @Column(name = "target_date")
    private java.time.LocalDate targetDate;

    public User() {}

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getTargetGoal() { return targetGoal; }
    public void setTargetGoal(String targetGoal) { this.targetGoal = targetGoal; }

    public java.time.LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(java.time.LocalDate targetDate) { this.targetDate = targetDate; }
}
