package com.skillforge.repository;

import com.skillforge.model.StudentProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends MongoRepository<StudentProgress, String> {
    Optional<StudentProgress> findByStudentIdAndCourseId(String studentId, String courseId);
    List<StudentProgress> findByStudentId(String studentId);
    List<StudentProgress> findByCourseId(String courseId);
    List<StudentProgress> findByCourseIdOrderByOverallScoreDesc(String courseId);
}
