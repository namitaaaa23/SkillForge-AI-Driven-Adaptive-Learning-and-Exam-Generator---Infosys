package com.skillforge.controller;

import com.skillforge.model.GuardianFeedback;
import com.skillforge.service.GuardianFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/guardian-feedback")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class GuardianFeedbackController {
    @Autowired
    private GuardianFeedbackService guardianFeedbackService;

    @PostMapping("/generate")
    public ResponseEntity<GuardianFeedback> generateFeedback(
            @RequestParam String guardianId,
            @RequestParam String studentId,
            @RequestParam String courseId,
            @RequestParam double performanceScore,
            @RequestParam String improvementArea,
            @RequestParam String strengthArea,
            @RequestParam String recommendation) {
        return ResponseEntity.ok(guardianFeedbackService.generateFeedback(
                guardianId, studentId, courseId, performanceScore, improvementArea, strengthArea, recommendation));
    }

    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<List<GuardianFeedback>> getGuardianFeedback(@PathVariable String guardianId) {
        return ResponseEntity.ok(guardianFeedbackService.getGuardianFeedback(guardianId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GuardianFeedback>> getStudentFeedback(@PathVariable String studentId) {
        return ResponseEntity.ok(guardianFeedbackService.getStudentFeedback(studentId));
    }

    @GetMapping("/guardian/{guardianId}/unread")
    public ResponseEntity<List<GuardianFeedback>> getUnreadFeedback(@PathVariable String guardianId) {
        return ResponseEntity.ok(guardianFeedbackService.getUnreadFeedback(guardianId));
    }

    @PostMapping("/{feedbackId}/read")
    public ResponseEntity<GuardianFeedback> markFeedbackAsRead(@PathVariable String feedbackId) {
        GuardianFeedback marked = guardianFeedbackService.markFeedbackAsRead(feedbackId);
        return marked != null ? ResponseEntity.ok(marked) : ResponseEntity.notFound().build();
    }
}
