package com.skillforge.controller;

import com.skillforge.model.LearningContent;
import com.skillforge.service.LearningContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/learning-content")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class LearningContentController {
    @Autowired
    private LearningContentService learningContentService;

    @PostMapping
    public ResponseEntity<LearningContent> createContent(@RequestBody LearningContent content) {
        return ResponseEntity.ok(learningContentService.createContent(content));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<LearningContent>> getCourseMaterials(@PathVariable String courseId) {
        return ResponseEntity.ok(learningContentService.getContentByCourse(courseId));
    }

    @GetMapping("/course/{courseId}/all")
    public ResponseEntity<List<LearningContent>> getAllCourseMaterials(@PathVariable String courseId) {
        return ResponseEntity.ok(learningContentService.getAllContentByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningContent> getContent(@PathVariable String id) {
        return learningContentService.getContentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningContent> updateContent(@PathVariable String id, @RequestBody LearningContent content) {
        LearningContent updated = learningContentService.updateContent(id, content);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable String id) {
        learningContentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<LearningContent> publishContent(@PathVariable String id) {
        LearningContent published = learningContentService.publishContent(id);
        return published != null ? ResponseEntity.ok(published) : ResponseEntity.notFound().build();
    }

    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<List<LearningContent>> getCreatorContent(@PathVariable String createdBy) {
        return ResponseEntity.ok(learningContentService.getContentByCreator(createdBy));
    }
}
