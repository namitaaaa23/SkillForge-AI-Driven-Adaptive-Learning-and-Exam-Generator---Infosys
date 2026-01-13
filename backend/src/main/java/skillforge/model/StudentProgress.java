package com.skillforge.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "student_progress")
public class StudentProgress {
    @Id
    private String id;
    private String studentId;
    private String courseId;
    private int totalLessons;
    private int completedLessons;
    private double progressPercentage;
    private double overallScore;
    private int studentRank;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, LessonProgress> lessonProgress;
    private String currentLevel;
    private int totalStudyHours;

    public static class LessonProgress {
        public String lessonId;
        public boolean completed;
        public double score;
        public LocalDateTime completedAt;
        public int attemptCount;

        public LessonProgress() {}
        public LessonProgress(String lessonId) {
            this.lessonId = lessonId;
            this.completed = false;
            this.attemptCount = 0;
        }
    }

    public StudentProgress() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.lessonProgress = new HashMap<>();
        this.progressPercentage = 0;
        this.overallScore = 0;
        this.totalStudyHours = 0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getTotalLessons() { return totalLessons; }
    public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }

    public int getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(int completedLessons) { this.completedLessons = completedLessons; }

    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

    public int getStudentRank() { return studentRank; }
    public void setStudentRank(int studentRank) { this.studentRank = studentRank; }

    public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Map<String, LessonProgress> getLessonProgress() { return lessonProgress; }
    public void setLessonProgress(Map<String, LessonProgress> lessonProgress) { this.lessonProgress = lessonProgress; }

    public String getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(String currentLevel) { this.currentLevel = currentLevel; }

    public int getTotalStudyHours() { return totalStudyHours; }
    public void setTotalStudyHours(int totalStudyHours) { this.totalStudyHours = totalStudyHours; }
}
