package com.skillforge.controller;

import com.skillforge.service.AIService;
import com.skillforge.service.LearningContentService;
import com.skillforge.model.LearningContent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AIController {
    @Autowired
    private AIService aiService;

    @Autowired
    private LearningContentService learningContentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/generate-exam")
    public ResponseEntity<String> generateExam(
            @RequestParam String courseId,
            @RequestParam String topic,
            @RequestParam(defaultValue = "10") int questionCount,
            @RequestParam(defaultValue = "Intermediate") String difficulty) {
        String examJson = aiService.generateExamQuestions(courseId, topic, questionCount, difficulty);
        return ResponseEntity.ok(examJson);
    }

    @PostMapping("/solve-doubt")
    public ResponseEntity<String> solveDoubt(
            @RequestParam String doubt,
            @RequestParam String courseId,
            @RequestParam String topic) {
        String solution = aiService.solveDoubt(doubt, courseId, topic);
        return ResponseEntity.ok(solution);
    }

    @PostMapping("/evaluate-exam")
    public ResponseEntity<String> evaluateExam(
            @RequestParam double score,
            @RequestParam int totalQuestions,
            @RequestParam String courseId) {
        String evaluation = aiService.evaluateExamResult(score, totalQuestions, courseId);
        return ResponseEntity.ok(evaluation);
    }

    @PostMapping("/generate-content")
    public ResponseEntity<Map<String, Object>> generateContent(@RequestBody Map<String, String> request) {
        try {
            String courseId = request.get("courseId");
            String courseName = request.get("courseName");
            String topic = request.get("topic");
            String contentType = request.get("contentType");
            String studentId = request.get("studentId");

            // Generate content using AI
            String generatedContent = aiService.generateLearningContent(courseId, topic, contentType);

            // Create LearningContent object to save to database
            LearningContent learningContent = new LearningContent();
            learningContent.setCourseId(courseId);
            learningContent.setTitle(topic);
            learningContent.setCreatedBy("AI-Generated");
            learningContent.setPublished(true);

            // Parse content type and set appropriate fields
            try {
                learningContent.setContentType(LearningContent.ContentType.valueOf(contentType));
            } catch (IllegalArgumentException e) {
                learningContent.setContentType(LearningContent.ContentType.TEXT);
            }

            // Extract description and content from AI response
            try {
                JsonNode jsonNode = objectMapper.readTree(generatedContent);
                if (jsonNode.has("description")) {
                    learningContent.setDescription(jsonNode.get("description").asText());
                } else {
                    learningContent.setDescription("AI-generated learning content for " + topic);
                }

                // Set text content or URL based on content type
                if (contentType.equals("TEXT") || contentType.equals("BLOG")) {
                    learningContent.setTextContent(generatedContent);
                } else if (contentType.equals("VIDEO") || contentType.equals("YOUTUBE")) {
                    if (jsonNode.has("url")) {
                        learningContent.setContentUrl(jsonNode.get("url").asText());
                    }
                    learningContent.setTextContent(generatedContent);
                } else if (contentType.equals("PDF")) {
                    learningContent.setTextContent(generatedContent);
                    if (jsonNode.has("url")) {
                        learningContent.setContentUrl(jsonNode.get("url").asText());
                    }
                }
            } catch (Exception e) {
                learningContent.setDescription("AI-generated learning content for " + topic);
                learningContent.setTextContent(generatedContent);
            }

            // Set sequence order (you might want to make this dynamic)
            learningContent.setSequenceOrder(0);

            // Save to database
            LearningContent savedContent = learningContentService.createContent(learningContent);

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Content generated successfully");
            response.put("content", savedContent);
            response.put("generatedText", generatedContent);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate content: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/generate-feedback")
    public ResponseEntity<String> generateFeedback(
            @RequestParam double performanceScore,
            @RequestParam String improvementArea,
            @RequestParam String strengthArea) {
        String feedback = aiService.generateGuardianFeedback(performanceScore, improvementArea, strengthArea);
        return ResponseEntity.ok(feedback);
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestParam String message) {
        String response = aiService.chatWithAi(message);
        return ResponseEntity.ok(response);
    }
}
