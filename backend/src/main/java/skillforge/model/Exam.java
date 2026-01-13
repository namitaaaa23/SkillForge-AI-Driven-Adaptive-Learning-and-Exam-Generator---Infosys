package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    private String id;

    private String title;
    private String description;
    private String courseId;
    private Integer durationMinutes = 60;
    private Integer totalQuestions = 0;
    private Integer passingScore = 70;
    private Boolean active = true;
    private Boolean published = false;
    private List<String> questionIds = new ArrayList<>();
    private List<String> examResultIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

