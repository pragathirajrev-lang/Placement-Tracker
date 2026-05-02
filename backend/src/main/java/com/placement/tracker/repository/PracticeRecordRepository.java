package com.placement.tracker.repository;

import com.placement.tracker.model.PracticeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface PracticeRecordRepository extends JpaRepository<PracticeRecord, Long> {
    List<PracticeRecord> findByUserIdOrderByPracticeDateDesc(Long userId);
    List<PracticeRecord> findByUserIdAndPracticeDateBetween(Long userId, LocalDate start, LocalDate end);
}
