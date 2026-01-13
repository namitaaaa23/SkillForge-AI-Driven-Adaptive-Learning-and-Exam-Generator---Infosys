package com.skillforge.repository;

import com.skillforge.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByExamId(String examId);
    void deleteByExamId(String examId);
}

