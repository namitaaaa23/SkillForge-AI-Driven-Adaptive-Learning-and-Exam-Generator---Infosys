package com.skillforge.repository;

import com.skillforge.model.GuardianFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GuardianFeedbackRepository extends MongoRepository<GuardianFeedback, String> {
    List<GuardianFeedback> findByGuardianId(String guardianId);
    List<GuardianFeedback> findByStudentId(String studentId);
    List<GuardianFeedback> findByGuardianIdAndStudentId(String guardianId, String studentId);
    List<GuardianFeedback> findByIsReadFalseAndGuardianId(String guardianId);
}
