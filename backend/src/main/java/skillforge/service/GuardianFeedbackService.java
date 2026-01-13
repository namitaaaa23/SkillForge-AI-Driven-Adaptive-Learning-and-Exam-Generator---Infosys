package com.skillforge.service;

import com.skillforge.model.GuardianFeedback;
import com.skillforge.repository.GuardianFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GuardianFeedbackService {
    @Autowired
    private GuardianFeedbackRepository guardianFeedbackRepository;

    public GuardianFeedback generateFeedback(String guardianId, String studentId, String courseId,
                                            double performanceScore, String improvementArea, 
                                            String strengthArea, String recommendation) {
        GuardianFeedback feedback = new GuardianFeedback();
        feedback.setGuardianId(guardianId);
        feedback.setStudentId(studentId);
        feedback.setCourseId(courseId);
        feedback.setPerformanceScore(performanceScore);
        feedback.setImprovementArea(improvementArea);
        feedback.setStrengthArea(strengthArea);
        feedback.setRecommendation(recommendation);
        feedback.setFeedbackType(GuardianFeedback.FeedbackType.WEEKLY);
        feedback.setFeedbackText(generateFeedbackText(performanceScore, improvementArea, strengthArea));
        feedback.setSentimentalInsight(generateSentimentalInsight(performanceScore, improvementArea));
        return guardianFeedbackRepository.save(feedback);
    }

    public List<GuardianFeedback> getGuardianFeedback(String guardianId) {
        return guardianFeedbackRepository.findByGuardianId(guardianId);
    }

    public List<GuardianFeedback> getStudentFeedback(String studentId) {
        return guardianFeedbackRepository.findByStudentId(studentId);
    }

    public List<GuardianFeedback> getUnreadFeedback(String guardianId) {
        return guardianFeedbackRepository.findByIsReadFalseAndGuardianId(guardianId);
    }

    public GuardianFeedback markFeedbackAsRead(String feedbackId) {
        GuardianFeedback feedback = guardianFeedbackRepository.findById(feedbackId).orElse(null);
        if (feedback != null) {
            feedback.setRead(true);
            feedback.setReadAt(LocalDateTime.now());
            return guardianFeedbackRepository.save(feedback);
        }
        return null;
    }

    private String generateFeedbackText(double score, String improvement, String strength) {
        StringBuilder text = new StringBuilder();
        text.append("Performance Score: ").append(String.format("%.1f", score)).append("/100. ");
        text.append("Strength: ").append(strength).append(". ");
        text.append("Area for Improvement: ").append(improvement).append(".");
        return text.toString();
    }

    private String generateSentimentalInsight(double score, String improvement) {
        if (score >= 80) {
            return "Your child is performing excellently and showing strong understanding of the material.";
        } else if (score >= 60) {
            return "Your child is making good progress. With focused effort on " + improvement + ", performance can improve further.";
        } else {
            return "Your child needs additional support in " + improvement + ". Consider scheduling a review session.";
        }
    }
}
