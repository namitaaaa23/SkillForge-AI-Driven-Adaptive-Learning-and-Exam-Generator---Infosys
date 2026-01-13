package com.skillforge.service;

import com.skillforge.model.ExamResult;
import com.skillforge.repository.ExamResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamEvaluationScheduler {

    private final ExamResultRepository examResultRepository;
    private final AIService aiService;

    /**
     * Runs every 5 minutes to check for exams that need AI evaluation
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    @Async
    public void evaluatePendingExams() {
        log.info("Starting scheduled exam evaluation check...");

        try {
            // Find exams that are ready for evaluation (20 minutes have passed)
            List<ExamResult> pendingResults = examResultRepository.findByEvaluationStatus("PENDING");

            for (ExamResult result : pendingResults) {
                if (result.getCompletedAt() != null) {
                    LocalDateTime evaluationTime = result.getCompletedAt().plusMinutes(20);

                    if (LocalDateTime.now().isAfter(evaluationTime)) {
                        evaluateExamWithAI(result);
                    } else if (result.getScheduledEvaluationTime() == null) {
                        // Schedule for evaluation
                        result.setScheduledEvaluationTime(evaluationTime);
                        result.setEvaluationStatus("SCHEDULED");
                        examResultRepository.save(result);
                        log.info("Scheduled exam {} for evaluation at {}", result.getId(), evaluationTime);
                    }
                }
            }

            // Also process scheduled exams
            List<ExamResult> scheduledResults = examResultRepository.findByEvaluationStatus("SCHEDULED");
            for (ExamResult result : scheduledResults) {
                if (result.getScheduledEvaluationTime() != null &&
                        LocalDateTime.now().isAfter(result.getScheduledEvaluationTime())) {
                    evaluateExamWithAI(result);
                }
            }

        } catch (Exception e) {
            log.error("Error in scheduled exam evaluation: {}", e.getMessage(), e);
        }
    }

    private void evaluateExamWithAI(ExamResult result) {
        try {
            log.info("Evaluating exam {} with AI...", result.getId());

            double percentage = (result.getScore() != null && result.getTotalQuestions() != null
                    && result.getTotalQuestions() > 0)
                            ? ((double) result.getScore() / result.getTotalQuestions() * 100)
                            : 0;

            // Call AI service for evaluation
            String aiResponse = aiService.evaluateExamResult(
                    result.getScore() != null ? result.getScore() : 0,
                    result.getTotalQuestions() != null ? result.getTotalQuestions() : 0,
                    result.getCourseId() != null ? result.getCourseId() : "General");

            // Parse AI response and update result
            result.setAiEvaluation(aiResponse);
            result.setEvaluatedAt(LocalDateTime.now());
            result.setEvaluationStatus("COMPLETED");

            // Determine performance level
            String performanceLevel;
            if (percentage >= 90)
                performanceLevel = "Excellent";
            else if (percentage >= 75)
                performanceLevel = "Good";
            else if (percentage >= 60)
                performanceLevel = "Average";
            else
                performanceLevel = "Needs Improvement";

            result.setPerformanceLevel(performanceLevel);

            // Generate strengths and improvement areas based on performance
            result.setStrengths(generateStrengths(percentage));
            result.setImprovementAreas(generateImprovementAreas(percentage));
            result.setRecommendations(generateRecommendations(percentage));

            // Add detailed analysis
            Map<String, Object> analysis = new HashMap<>();
            analysis.put("accuracyRate", percentage);
            analysis.put("timeEfficiency", calculateTimeEfficiency(result));
            analysis.put("evaluationDate", LocalDateTime.now().toString());
            result.setDetailedAnalysis(analysis);

            examResultRepository.save(result);

            log.info("Successfully evaluated exam {} - Performance: {} ({}%)",
                    result.getId(), performanceLevel, String.format("%.2f", percentage));

        } catch (Exception e) {
            log.error("Error evaluating exam {}: {}", result.getId(), e.getMessage(), e);
            result.setEvaluationStatus("ERROR");
            result.setAiEvaluation("Evaluation failed: " + e.getMessage());
            examResultRepository.save(result);
        }
    }

    private List<String> generateStrengths(double percentage) {
        if (percentage >= 90) {
            return Arrays.asList(
                    "Exceptional understanding of core concepts",
                    "Strong problem-solving abilities",
                    "Consistent high performance");
        } else if (percentage >= 75) {
            return Arrays.asList(
                    "Good grasp of fundamental concepts",
                    "Solid analytical skills",
                    "Above-average performance");
        } else if (percentage >= 60) {
            return Arrays.asList(
                    "Basic understanding of key topics",
                    "Competent in core areas");
        } else {
            return Arrays.asList(
                    "Shows effort and dedication",
                    "Demonstrates interest in learning");
        }
    }

    private List<String> generateImprovementAreas(double percentage) {
        if (percentage >= 90) {
            return Arrays.asList(
                    "Maintain current excellence",
                    "Consider advanced topics");
        } else if (percentage >= 75) {
            return Arrays.asList(
                    "Focus on mastering advanced concepts",
                    "Pay attention to detail");
        } else if (percentage >= 60) {
            return Arrays.asList(
                    "Strengthen fundamental understanding",
                    "Practice more problem-solving",
                    "Review weak areas identified in exam");
        } else {
            return Arrays.asList(
                    "Revisit core concepts thoroughly",
                    "Seek additional help and resources",
                    "Increase study time and practice",
                    "Focus on understanding over memorization");
        }
    }

    private List<String> generateRecommendations(double percentage) {
        if (percentage >= 90) {
            return Arrays.asList(
                    "Challenge yourself with advanced projects",
                    "Consider mentoring peers",
                    "Explore related advanced topics");
        } else if (percentage >= 75) {
            return Arrays.asList(
                    "Practice with more challenging questions",
                    "Review areas where you lost marks",
                    "Engage in peer discussions");
        } else if (percentage >= 60) {
            return Arrays.asList(
                    "Schedule regular review sessions",
                    "Work through practice problems daily",
                    "Join study groups for collaborative learning");
        } else {
            return Arrays.asList(
                    "Attend additional tutoring sessions",
                    "Create a structured study schedule",
                    "Break down complex topics into smaller parts",
                    "Don't hesitate to ask questions");
        }
    }

    private String calculateTimeEfficiency(ExamResult result) {
        if (result.getTimeTakenMinutes() == null)
            return "Not recorded";

        int estimatedTime = result.getTotalQuestions() != null ? result.getTotalQuestions() * 2 : 30;
        int actualTime = result.getTimeTakenMinutes();

        if (actualTime < estimatedTime * 0.7)
            return "Very Fast";
        else if (actualTime < estimatedTime)
            return "Good Pace";
        else if (actualTime < estimatedTime * 1.3)
            return "Adequate";
        else
            return "Could Improve Speed";
    }
}
