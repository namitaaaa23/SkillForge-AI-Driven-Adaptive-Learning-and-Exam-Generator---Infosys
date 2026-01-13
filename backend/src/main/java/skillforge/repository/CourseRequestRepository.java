package com.skillforge.repository;

import com.skillforge.model.CourseRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRequestRepository extends MongoRepository<CourseRequest, String> {
    List<CourseRequest> findByLearnerId(String learnerId);

    List<CourseRequest> findByStatus(String status);

    List<CourseRequest> findAllByOrderByRequestedAtDesc();
}
