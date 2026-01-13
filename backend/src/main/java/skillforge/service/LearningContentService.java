package com.skillforge.service;

import com.skillforge.model.LearningContent;
import com.skillforge.repository.LearningContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LearningContentService {
    @Autowired
    private LearningContentRepository learningContentRepository;

    public LearningContent createContent(LearningContent content) {
        content.setCreatedAt(LocalDateTime.now());
        content.setUpdatedAt(LocalDateTime.now());
        return learningContentRepository.save(content);
    }

    public List<LearningContent> getContentByCourse(String courseId) {
        return learningContentRepository.findByCourseIdAndIsPublishedTrue(courseId);
    }

    public List<LearningContent> getAllContentByCourse(String courseId) {
        return learningContentRepository.findByCourseId(courseId);
    }

    public Optional<LearningContent> getContentById(String id) {
        return learningContentRepository.findById(id);
    }

    public LearningContent updateContent(String id, LearningContent content) {
        Optional<LearningContent> existing = learningContentRepository.findById(id);
        if (existing.isPresent()) {
            LearningContent updated = existing.get();
            updated.setTitle(content.getTitle());
            updated.setDescription(content.getDescription());
            updated.setContentUrl(content.getContentUrl());
            updated.setDifficulty(content.getDifficulty());
            updated.setUpdatedAt(LocalDateTime.now());
            return learningContentRepository.save(updated);
        }
        return null;
    }

    public void deleteContent(String id) {
        learningContentRepository.deleteById(id);
    }

    public LearningContent publishContent(String id) {
        Optional<LearningContent> content = learningContentRepository.findById(id);
        if (content.isPresent()) {
            LearningContent updated = content.get();
            updated.setPublished(true);
            updated.setUpdatedAt(LocalDateTime.now());
            return learningContentRepository.save(updated);
        }
        return null;
    }

    public List<LearningContent> getContentByCreator(String createdBy) {
        return learningContentRepository.findByCreatedBy(createdBy);
    }
}
