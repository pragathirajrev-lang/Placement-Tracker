package com.placement.tracker.controller;

import com.placement.tracker.model.PracticeRecord;
import com.placement.tracker.model.User;
import com.placement.tracker.repository.PracticeRecordRepository;
import com.placement.tracker.repository.UserRepository;
import com.placement.tracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    @Autowired
    PracticeRecordRepository practiceRepository;

    @Autowired
    UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping
    public List<PracticeRecord> getAllPracticeRecords() {
        User user = getCurrentUser();
        return practiceRepository.findByUserIdOrderByPracticeDateDesc(user.getId());
    }

    @PostMapping
    public PracticeRecord addPracticeRecord(@RequestBody PracticeRecord record) {
        User user = getCurrentUser();
        record.setUser(user);
        if (record.getPracticeDate() == null) {
            record.setPracticeDate(LocalDate.now());
        }
        return practiceRepository.save(record);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePracticeRecord(@PathVariable Long id) {
        PracticeRecord record = practiceRepository.findById(id).orElseThrow();
        User user = getCurrentUser();
        
        if (!record.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        practiceRepository.delete(record);
        return ResponseEntity.ok().build();
    }
}
