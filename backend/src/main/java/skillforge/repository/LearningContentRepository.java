package com.skillforge.repository;

import com.skillforge.model.LearningContent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningContentRepository extends MongoRepository<LearningContent, String> {
    List<LearningContent> findByCourseId(String courseId);
    List<LearningContent> findByCourseIdAndIsPublishedTrue(String courseId);
    List<LearningContent> findByCreatedBy(String createdBy);
}
