package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "exam_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamResult {

    @Id
    private String id;

    private String examId;
    private String userId;
    private String studentEmail;
    private String studentName;
    private String courseId;
    private Integer score = 0;
    private Integer totalQuestions = 0;
    private Integer correctAnswers = 0;
    private Boolean passed = false;
    private Integer timeTakenMinutes;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt = LocalDateTime.now();

    // AI Evaluation Fields (populated after 20 minutes)
    private String evaluationStatus = "PENDING"; // PENDING, SCHEDULED, COMPLETED
    private LocalDateTime scheduledEvaluationTime;
    private LocalDateTime evaluatedAt;
    private String aiEvaluation;
    private String performanceLevel; // Excellent, Good, Average, Needs Improvement
    private List<String> strengths;
    private List<String> improvementAreas;
    private List<String> recommendations;
    private Map<String, Object> detailedAnalysis;
}
