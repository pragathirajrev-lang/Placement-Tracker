package com.placement.tracker.controller;

import com.placement.tracker.model.ApplicationStatus;
import com.placement.tracker.model.PracticeRecord;
import com.placement.tracker.model.User;
import com.placement.tracker.repository.JobApplicationRepository;
import com.placement.tracker.repository.PracticeRecordRepository;
import com.placement.tracker.repository.UserRepository;
import com.placement.tracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    JobApplicationRepository applicationRepository;

    @Autowired
    PracticeRecordRepository practiceRepository;

    @Autowired
    UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        User user = getCurrentUser();
        Long userId = user.getId();

        long totalApplications = applicationRepository.countByUserId(userId);
        long selected = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.SELECTED);
        long rejected = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED);
        long interview = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW);
        long applied = applicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED);

        List<PracticeRecord> records = practiceRepository.findByUserIdOrderByPracticeDateDesc(userId);
        
        // 1. Fixed Streak Calculation
        List<LocalDate> uniqueDates = records.stream()
                .map(PracticeRecord::getPracticeDate)
                .distinct()
                .collect(Collectors.toList());
                
        int streak = 0;
        LocalDate currentDate = LocalDate.now();

        for (LocalDate date : uniqueDates) {
            if (date.equals(currentDate) || date.equals(currentDate.minusDays(1))) {
                streak++;
                currentDate = date;
            } else {
                break;
            }
        }
        
        // 2. Topic Wise Performance
        Map<String, Integer> topicWisePerformance = records.stream()
                .collect(Collectors.groupingBy(
                        PracticeRecord::getTopic,
                        Collectors.summingInt(PracticeRecord::getProblemsSolved)
                ));
                
        // 3. Daily Progress (last 7 days)
        Map<LocalDate, Integer> dailyProgressMap = records.stream()
                .filter(r -> !r.getPracticeDate().isBefore(LocalDate.now().minusDays(6)))
                .collect(Collectors.groupingBy(
                        PracticeRecord::getPracticeDate,
                        Collectors.summingInt(PracticeRecord::getProblemsSolved)
                ));
                
        List<Map<String, Object>> dailyProgress = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusDays(i);
            Map<String, Object> map = new HashMap<>();
            map.put("date", d.toString());
            map.put("count", dailyProgressMap.getOrDefault(d, 0));
            dailyProgress.add(map);
        }

        // 4. Weakest Topic
        String weakestTopic = topicWisePerformance.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Any Topic");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", totalApplications);
        stats.put("selected", selected);
        stats.put("rejected", rejected);
        stats.put("inProgress", interview + applied);
        stats.put("streak", streak);
        
        // New analytics data
        stats.put("topicPerformance", topicWisePerformance);
        stats.put("dailyProgress", dailyProgress);
        stats.put("weakestTopic", weakestTopic);
        
        // Target Goals
        stats.put("targetGoal", user.getTargetGoal());
        stats.put("targetDate", user.getTargetDate() != null ? user.getTargetDate().toString() : null);

        return stats;
    }

    @org.springframework.web.bind.annotation.PostMapping("/goal")
    public Map<String, String> setTargetGoal(@org.springframework.web.bind.annotation.RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        user.setTargetGoal(payload.get("targetGoal"));
        if (payload.get("targetDate") != null && !payload.get("targetDate").isEmpty()) {
            user.setTargetDate(LocalDate.parse(payload.get("targetDate")));
        } else {
            user.setTargetDate(null);
        }
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Goal updated successfully");
        return response;
    }
}
