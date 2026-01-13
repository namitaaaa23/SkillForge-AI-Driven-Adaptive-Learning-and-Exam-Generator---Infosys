package com.skillforge.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "guardian_feedback")
public class GuardianFeedback {
    @Id
    private String id;
    private String guardianId;
    private String studentId;
    private String courseId;
    private String feedbackText;
    private String sentimentalInsight;
    private double performanceScore;
    private String improvementArea;
    private String strengthArea;
    private String recommendation;
    private LocalDateTime generatedAt;
    private LocalDateTime readAt;
    private boolean isRead;
    private FeedbackType feedbackType;

    public enum FeedbackType {
        WEEKLY, MONTHLY, EXAM_RESULT, MILESTONE
    }

    public GuardianFeedback() {
        this.generatedAt = LocalDateTime.now();
        this.isRead = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGuardianId() { return guardianId; }
    public void setGuardianId(String guardianId) { this.guardianId = guardianId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getFeedbackText() { return feedbackText; }
    public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

    public String getSentimentalInsight() { return sentimentalInsight; }
    public void setSentimentalInsight(String sentimentalInsight) { this.sentimentalInsight = sentimentalInsight; }

    public double getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(double performanceScore) { this.performanceScore = performanceScore; }

    public String getImprovementArea() { return improvementArea; }
    public void setImprovementArea(String improvementArea) { this.improvementArea = improvementArea; }

    public String getStrengthArea() { return strengthArea; }
    public void setStrengthArea(String strengthArea) { this.strengthArea = strengthArea; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public FeedbackType getFeedbackType() { return feedbackType; }
    public void setFeedbackType(FeedbackType feedbackType) { this.feedbackType = feedbackType; }
}
