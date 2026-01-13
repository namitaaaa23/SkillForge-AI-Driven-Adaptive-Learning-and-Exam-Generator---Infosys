package com.skillforge.repository;

import com.skillforge.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Notification> findByStudentIdAndIsReadFalseOrderByCreatedAtDesc(String studentId);
    List<Notification> findByStudentIdAndType(String studentId, String type);
}
