package com.placement.tracker.controller;

import com.placement.tracker.model.StudyNote;
import com.placement.tracker.model.User;
import com.placement.tracker.repository.StudyNoteRepository;
import com.placement.tracker.repository.UserRepository;
import com.placement.tracker.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class StudyNoteController {

    @Autowired
    StudyNoteRepository studyNoteRepository;

    @Autowired
    UserRepository userRepository;

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @GetMapping
    public List<StudyNote> getUserNotes() {
        return studyNoteRepository.findByUserIdOrderByCreatedAtDesc(getCurrentUser().getId());
    }

    @PostMapping
    public StudyNote addNote(@RequestBody StudyNote note) {
        note.setUser(getCurrentUser());
        return studyNoteRepository.save(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        StudyNote note = studyNoteRepository.findById(id).orElseThrow();
        if (!note.getUser().getId().equals(getCurrentUser().getId())) {
            return ResponseEntity.status(403).body("Unauthorized to delete this note");
        }
        studyNoteRepository.delete(note);
        return ResponseEntity.ok("Note deleted");
    }
}
