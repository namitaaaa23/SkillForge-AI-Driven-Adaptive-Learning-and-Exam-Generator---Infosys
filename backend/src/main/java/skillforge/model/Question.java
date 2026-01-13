package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    private String id;

    private String questionText;
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;
    private List<String> options = new ArrayList<>();
    private List<String> correctAnswers = new ArrayList<>();
    private Integer points = 1;
    private String explanation;
    private String examId;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum QuestionType {
        MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
    }
}

