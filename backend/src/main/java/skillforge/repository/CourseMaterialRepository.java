package com.skillforge.repository;

import com.skillforge.model.CourseMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialRepository extends MongoRepository<CourseMaterial, String> {
    List<CourseMaterial> findByCourseIdOrderByOrderIndexAsc(String courseId);
}
