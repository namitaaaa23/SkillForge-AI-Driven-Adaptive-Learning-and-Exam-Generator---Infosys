package com.skillforge.controller;

import com.skillforge.model.StudentProgress;
import com.skillforge.service.StudentProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student-progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StudentProgressController {
    @Autowired
    private StudentProgressService studentProgressService;

    @PostMapping("/initialize")
    public ResponseEntity<StudentProgress> initializeProgress(
            @RequestParam String studentId,
            @RequestParam String courseId,
            @RequestParam int totalLessons) {
        return ResponseEntity.ok(studentProgressService.initializeProgress(studentId, courseId, totalLessons));
    }

    @PostMapping("/update-lesson")
    public ResponseEntity<StudentProgress> updateLessonCompletion(
            @RequestParam String studentId,
            @RequestParam String courseId,
            @RequestParam String lessonId,
            @RequestParam double score) {
        StudentProgress updated = studentProgressService.updateLessonCompletion(studentId, courseId, lessonId, score);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{studentId}/{courseId}")
    public ResponseEntity<StudentProgress> getProgress(
            @PathVariable String studentId,
            @PathVariable String courseId) {
        return studentProgressService.getProgress(studentId, courseId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentProgress>> getStudentAllProgress(@PathVariable String studentId) {
        return ResponseEntity.ok(studentProgressService.getStudentAllProgress(studentId));
    }

    @GetMapping("/rankings/{courseId}")
    public ResponseEntity<List<StudentProgress>> getCourseRankings(@PathVariable String courseId) {
        studentProgressService.updateStudentRanks(courseId);
        return ResponseEntity.ok(studentProgressService.getCourseRankings(courseId));
    }

    @PostMapping("/update-ranks/{courseId}")
    public ResponseEntity<String> updateRanks(@PathVariable String courseId) {
        studentProgressService.updateStudentRanks(courseId);
        return ResponseEntity.ok("Rankings updated successfully");
    }
}
