package com.placement.tracker.controller;

import com.placement.tracker.model.JobApplication;
import com.placement.tracker.model.User;
import com.placement.tracker.repository.JobApplicationRepository;
import com.placement.tracker.repository.UserRepository;
import com.placement.tracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    JobApplicationRepository applicationRepository;

    @Autowired
    UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping
    public List<JobApplication> getAllApplications() {
        User user = getCurrentUser();
        return applicationRepository.findByUserIdOrderByAppliedDateDesc(user.getId());
    }

    @PostMapping
    public JobApplication addApplication(@RequestBody JobApplication application) {
        User user = getCurrentUser();
        application.setUser(user);
        if (application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now());
        }
        return applicationRepository.save(application);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(@PathVariable Long id, @RequestBody JobApplication applicationDetails) {
        JobApplication application = applicationRepository.findById(id).orElseThrow();
        User user = getCurrentUser();
        
        if (!application.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        application.setCompanyName(applicationDetails.getCompanyName());
        application.setRole(applicationDetails.getRole());
        application.setStatus(applicationDetails.getStatus());
        
        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        JobApplication application = applicationRepository.findById(id).orElseThrow();
        User user = getCurrentUser();
        
        if (!application.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        applicationRepository.delete(application);
        return ResponseEntity.ok().build();
    }
}
