package com.placement.tracker.repository;

import com.placement.tracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserIdOrderByAppliedDateDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, com.placement.tracker.model.ApplicationStatus status);
}
