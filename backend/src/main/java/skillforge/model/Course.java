package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private String id;

    private String title;
    private String description;
    private String thumbnailUrl;
    private DifficultyLevel difficultyLevel = DifficultyLevel.BEGINNER;
    private Integer estimatedHours = 0;
    private Boolean published = false;
    private Boolean active = true;
    private String instructorId;
    private List<String> enrolledUserIds = new ArrayList<>();
    private List<String> assignedLearnerEmails = new ArrayList<>(); // Learners assigned by admin
    private String assignmentType = "PUBLIC"; // PUBLIC or ADMIN_ASSIGNED
    private List<String> examIds = new ArrayList<>();
    private List<String> materialIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
}
