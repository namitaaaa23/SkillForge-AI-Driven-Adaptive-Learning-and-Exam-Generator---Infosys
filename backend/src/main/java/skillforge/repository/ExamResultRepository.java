package com.skillforge.repository;

import com.skillforge.model.ExamResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends MongoRepository<ExamResult, String> {
    List<ExamResult> findByUserId(String userId);

    List<ExamResult> findByExamId(String examId);

    Optional<ExamResult> findByExamIdAndUserId(String examId, String userId);

    List<ExamResult> findByUserIdOrderByCompletedAtDesc(String userId);

    List<ExamResult> findByEvaluationStatus(String status);
}
