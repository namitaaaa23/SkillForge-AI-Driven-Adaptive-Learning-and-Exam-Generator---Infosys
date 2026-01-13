package com.skillforge.repository;

import com.skillforge.model.Communication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommunicationRepository extends MongoRepository<Communication, String> {
    List<Communication> findByGuardianId(String guardianId);
    List<Communication> findByAdminId(String adminId);
    List<Communication> findByStudentId(String studentId);
    Optional<Communication> findByGuardianIdAndAdminIdAndStudentId(String guardianId, String adminId, String studentId);
    List<Communication> findByIsActiveTrueOrderByLastMessageAtDesc(String guardianId);
}
