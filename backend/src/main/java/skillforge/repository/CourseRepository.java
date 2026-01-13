package com.skillforge.repository;

import com.skillforge.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByPublishedTrueAndActiveTrue();
    List<Course> findByInstructorId(String instructorId);
}

