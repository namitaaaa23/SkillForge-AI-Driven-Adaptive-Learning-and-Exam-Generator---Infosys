package com.skillforge.repository;

import com.skillforge.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    List<Exam> findByCourseId(String courseId);
    List<Exam> findByCourseIdAndPublishedTrueAndActiveTrue(String courseId);
}

