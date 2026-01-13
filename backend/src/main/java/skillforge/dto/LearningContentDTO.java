package com.skillforge.dto;

import java.time.LocalDateTime;

public class LearningContentDTO {
    public String id;
    public String courseId;
    public String title;
    public String description;
    public String contentType;
    public String contentUrl;
    public int sequenceOrder;
    public String difficulty;
    public boolean isPublished;
    public LocalDateTime createdAt;
}

class StudentProgressDTO {
    public String id;
    public String studentId;
    public String courseId;
    public int completedLessons;
    public int totalLessons;
    public double progressPercentage;
    public double overallScore;
    public int studentRank;
    public String currentLevel;
    public int totalStudyHours;
}

class GuardianFeedbackDTO {
    public String id;
    public String studentId;
    public String feedbackText;
    public String sentimentalInsight;
    public double performanceScore;
    public String improvementArea;
    public String strengthArea;
    public String recommendation;
    public LocalDateTime generatedAt;
    public boolean isRead;
}

class NotificationDTO {
    public String id;
    public String title;
    public String message;
    public String type;
    public LocalDateTime createdAt;
    public boolean isRead;
    public String priority;
}
