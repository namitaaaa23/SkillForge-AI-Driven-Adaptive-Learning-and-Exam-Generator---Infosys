package com.skillforge.service;

import com.skillforge.config.GeminiConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AIService {
    @Autowired
    private GeminiConfig geminiConfig;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    public String generateExamQuestions(String courseId, String topic, int questionCount, String difficulty) {
        log.info("Generating {} exam questions for topic '{}' with difficulty '{}'", questionCount, topic, difficulty);

        String prompt = String.format(
                "Generate exactly %d high-quality Multiple Choice Questions (MCQs) for the topic '%s' at '%s' difficulty level for the course '%s'. "
                        + "Each question MUST have 4 options (A, B, C, D). "
                        + "Format the output as a PURE JSON array of objects. "
                        + "Each object must have these EXACT fields: "
                        + "1. 'id': a unique string like 'q1', 'q2', etc. "
                        + "2. 'questionText': the question text. "
                        + "3. 'type': MUST be 'MULTIPLE_CHOICE'. "
                        + "4. 'options': an array of 4 strings. "
                        + "5. 'correctAnswer': the correct option index (0, 1, 2, or 3). "
                        + "6. 'explanation': a brief explanation of why that answer is correct. "
                        + "IMPORTANT: Return ONLY the JSON array. No conversational text, no markdown code blocks like ```json.",
                questionCount, topic, difficulty, courseId);

        try {
            log.debug("Calling Gemini API with prompt: {}", prompt);
            String response = callGeminiAPI(prompt);
            log.info("Successfully received response from Gemini API");
            return formatExamResponse(response, courseId, topic, difficulty);
        } catch (IllegalArgumentException e) {
            log.error("Gemini API Configuration Local Validation Error: {}", e.getMessage());
            log.warn("Falling back to local generation for {} questions due to invalid config", questionCount);
            return getFallbackExamResponse(courseId, topic, questionCount, difficulty);
        } catch (IOException | InterruptedException e) {
            log.error("Gemini API Network/IO Error during exam generation: {}", e.getMessage());
            if (e.getMessage().contains("401") || e.getMessage().contains("403")) {
                log.error("Authentication Failure: Please check if your Gemini API key ({}) is valid.",
                        geminiConfig.getApiKey());
            }
            log.warn("Falling back to local generation for {} questions due to network error", questionCount);
            return getFallbackExamResponse(courseId, topic, questionCount, difficulty);
        } catch (Exception e) {
            log.error("Unexpected Error during Gemini exam generation: {}", e.getMessage(), e);
            log.warn("Falling back to local generation for {} questions", questionCount);
            return getFallbackExamResponse(courseId, topic, questionCount, difficulty);
        }
    }

    public String solveDoubt(String doubt, String courseId, String topic) {
        String prompt = String.format(
                "Solve this doubt: '%s' related to topic '%s' in course '%s'. "
                        + "Provide: solution, detailed explanation, related concepts (array), practice problems (array), resources (array). "
                        + "Format as JSON.",
                doubt, topic, courseId);

        try {
            String response = callGeminiAPI(prompt);
            return formatDoubtResponse(response);
        } catch (Exception e) {
            return getFallbackDoubtResponse(doubt, topic);
        }
    }

    public String evaluateExamResult(double score, int totalQuestions, String courseId) {
        double percentage = (score / totalQuestions) * 100;
        String prompt = String.format(
                "Evaluate exam performance: Score %f out of %d (%.2f%%). "
                        + "Provide: performanceLevel, feedback, improvementAreas, nextSteps, strengths. "
                        + "Format as JSON.",
                score, totalQuestions, percentage);

        try {
            String response = callGeminiAPI(prompt);
            return formatEvaluationResponse(response, score, totalQuestions, percentage);
        } catch (Exception e) {
            return getFallbackEvaluationResponse(score, totalQuestions, percentage);
        }
    }

    public String generateLearningContent(String courseId, String topic, String contentType) {
        String prompt = String.format(
                "Generate %s learning content for topic '%s' in course '%s'. "
                        + "Include: title, description, key points, difficulty level. Format as JSON.",
                contentType, topic, courseId);

        try {
            String response = callGeminiAPI(prompt);
            return formatContentResponse(response, contentType);
        } catch (Exception e) {
            return getFallbackContentResponse(topic, contentType);
        }
    }

    public String generateGuardianFeedback(double performanceScore, String improvementArea, String strengthArea) {
        String prompt = String.format(
                "Generate guardian feedback for student performance score %.2f. "
                        + "Strength: %s, Improvement area: %s. "
                        + "Provide: sentimentalInsight, recommendation, actionItems (array). Format as JSON.",
                performanceScore, strengthArea, improvementArea);

        try {
            String response = callGeminiAPI(prompt);
            return formatFeedbackResponse(response, performanceScore, improvementArea, strengthArea);
        } catch (Exception e) {
            return getFallbackFeedbackResponse(performanceScore, improvementArea, strengthArea);
        }
    }

    public String chatWithAi(String message) {
        String prompt = String.format(
                "You are a helpful AI learning assistant for the SkillForge platform. "
                        + "User Message: \"%s\" "
                        + "INSTRUCTIONS: "
                        + "1. Answer the user's question helpfully and concisely. "
                        + "2. STRICTLY PROHIBITED: Do not generate any adult, sexually explicit (18+), violent, or inappropriate content. If the user asks for such content, politely refuse and steer the conversation back to learning. "
                        + "3. Provide the response as plain text only (no JSON, no complex markdown structures unless necessary for code).",
                message);

        try {
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            System.err.println("AI Chat Error: " + e.getMessage());
            e.printStackTrace();
            // Fallback to simple pattern-based responses
            return generateFallbackResponse(message);
        }
    }

    private String generateFallbackResponse(String message) {
        String lowerMessage = message.toLowerCase();

        // Java-related questions
        if (lowerMessage.contains("java")) {
            return "Java is a popular programming language used for building applications. It's known for being platform-independent (write once, run anywhere) and is widely used in enterprise applications, Android development, and web services. Key concepts include OOP (Object-Oriented Programming), JVM (Java Virtual Machine), and robust libraries.";
        }

        // Python-related
        if (lowerMessage.contains("python")) {
            return "Python is a versatile, beginner-friendly programming language known for its clean syntax. It's used in web development, data science, machine learning, automation, and more. Python emphasizes readability and has a vast ecosystem of libraries like NumPy, Pandas, and Django.";
        }

        // Programming basics
        if (lowerMessage.contains("programming") || lowerMessage.contains("code") || lowerMessage.contains("coding")) {
            return "Programming is the process of creating instructions for computers to follow. Start with understanding basic concepts like variables, loops, conditionals, and functions. Practice regularly, build projects, and don't be afraid to make mistakes - they're part of learning!";
        }

        // AI/ML questions
        if (lowerMessage.contains("artificial intelligence") || lowerMessage.contains("ai")
                || lowerMessage.contains("machine learning") || lowerMessage.contains("ml")) {
            return "Artificial Intelligence (AI) is the simulation of human intelligence by machines. Machine Learning (ML) is a subset of AI where systems learn from data. Key areas include neural networks, deep learning, and natural language processing. Start with understanding basic statistics and Python programming.";
        }

        // Web development
        if (lowerMessage.contains("web") || lowerMessage.contains("html") || lowerMessage.contains("css")
                || lowerMessage.contains("javascript")) {
            return "Web development involves creating websites and web applications. Frontend uses HTML (structure), CSS (styling), and JavaScript (interactivity). Backend involves server-side languages like Node.js, Python, or Java. Learn the basics first, then explore frameworks like React, Vue, or Angular.";
        }

        // Data structures
        if (lowerMessage.contains("data structure") || lowerMessage.contains("algorithm")) {
            return "Data structures organize and store data efficiently (arrays, linked lists, trees, graphs, etc.). Algorithms are step-by-step procedures to solve problems. Understanding both is crucial for writing efficient code and is often tested in technical interviews.";
        }

        // Database
        if (lowerMessage.contains("database") || lowerMessage.contains("sql")) {
            return "Databases store and manage data. SQL (Structured Query Language) databases like MySQL and PostgreSQL use tables with predefined schemas. NoSQL databases like MongoDB offer more flexibility. Learn basic SQL commands: SELECT, INSERT, UPDATE, DELETE, and JOIN operations.";
        }

        // Study tips
        if (lowerMessage.contains("study") || lowerMessage.contains("learn")) {
            return "Effective learning tips: 1) Practice consistently, 2) Build projects, not just tutorials, 3) Understand concepts, don't just memorize, 4) Join coding communities, 5) Review and debug your code regularly. Remember, everyone learns at their own pace!";
        }

        // Greetings
        if (lowerMessage.matches(".*\\b(hi|hello|hey|hola)\\b.*")) {
            return "Hello! I'm your SkillForge AI assistant. I'm here to help you with your learning journey. You can ask me about programming concepts, study tips, or course-related questions!";
        }

        // Default response
        return "I'm here to help you with your learning! Right now I'm running in offline mode, so I can answer questions about: programming languages (Java, Python, JavaScript), web development, data structures, algorithms, databases, and study tips. What would you like to know?";
    }

    private String callGeminiAPI(String prompt) throws IOException, InterruptedException {
        String apiKey = geminiConfig.getApiKey();
        String model = geminiConfig.getModel();

        log.debug("Gemini API Request - Model: {}", model);
        log.debug("Gemini API Request - API Key: {}",
                (apiKey != null ? "CONFIGURED (Starts with " + apiKey.substring(0, Math.min(apiKey.length(), 4)) + ")"
                        : "NULL"));

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_")) {
            log.error("CRITICAL: Gemini API key is missing or invalid placeholder detected!");
            throw new IllegalArgumentException("Gemini API key not configured properly in application.properties");
        }

        String url = GEMINI_API_URL + model + ":generateContent?key=" + apiKey;

        String requestBody = String.format(
                "{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        log.info("Dispatching request to Gemini API (Model: {})...", model);
        long startTime = System.currentTimeMillis();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        long duration = System.currentTimeMillis() - startTime;

        log.info("Gemini API response received in {}ms. Status Code: {}", duration, response.statusCode());

        if (response.statusCode() != 200) {
            String errorMsg = response.body();
            log.error("Gemini API Request FAILED with Status {}. Error Body: {}", response.statusCode(), errorMsg);

            switch (response.statusCode()) {
                case 400:
                    log.error("BAD REQUEST (400): Check JSON formatting or model constraints. Body: {}", errorMsg);
                    break;
                case 401:
                    log.error("UNAUTHORIZED (401): The API key is invalid or expired. Current Key: {}", apiKey);
                    break;
                case 403:
                    log.error("FORBIDDEN (403): API key does not have permission for this model or quota exceeded.");
                    break;
                case 404:
                    log.error("NOT FOUND (404): The requested model '{}' was not found.", model);
                    break;
                case 429:
                    log.error("TOO MANY REQUESTS (429): You have hit the rate limit for the Gemini API.");
                    break;
                case 500:
                    log.error("INTERNAL SERVER ERROR (500): Google's servers are experiencing issues.");
                    break;
                default:
                    log.error("UNKNOWN ERROR {}: {}", response.statusCode(), errorMsg);
                    break;
            }

            throw new IOException("Gemini API error (" + response.statusCode() + "): " + errorMsg);
        }

        log.debug("Parsing Gemini API JSON response...");
        try {
            JsonNode jsonNode = objectMapper.readTree(response.body());
            String result = jsonNode.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();
            log.info("Successfully extracted text from Gemini API response");
            return result;
        } catch (Exception e) {
            log.error("Failed to parse Gemini API response: {}. Raw body: {}", e.getMessage(), response.body());
            throw new IOException("Failed to parse Gemini API response", e);
        }
    }

    private String formatExamResponse(String geminiResponse, String courseId, String topic, String difficulty) {
        return "{\n" +
                "  \"courseId\": \"" + courseId + "\",\n" +
                "  \"topic\": \"" + topic + "\",\n" +
                "  \"difficulty\": \"" + difficulty + "\",\n" +
                "  \"questions\": " + geminiResponse + "\n" +
                "}";
    }

    private String formatDoubtResponse(String geminiResponse) {
        return geminiResponse;
    }

    private String formatEvaluationResponse(String geminiResponse, double score, int totalQuestions,
            double percentage) {
        return "{\n" +
                "  \"score\": " + score + ",\n" +
                "  \"totalQuestions\": " + totalQuestions + ",\n" +
                "  \"percentage\": " + String.format("%.2f", percentage) + ",\n" +
                "  \"evaluation\": " + geminiResponse + "\n" +
                "}";
    }

    private String formatContentResponse(String geminiResponse, String contentType) {
        return "{\n" +
                "  \"contentType\": \"" + contentType + "\",\n" +
                "  \"content\": " + geminiResponse + "\n" +
                "}";
    }

    private String formatFeedbackResponse(String geminiResponse, double performanceScore, String improvementArea,
            String strengthArea) {
        return "{\n" +
                "  \"performanceScore\": " + performanceScore + ",\n" +
                "  \"improvementArea\": \"" + improvementArea + "\",\n" +
                "  \"strengthArea\": \"" + strengthArea + "\",\n" +
                "  \"feedback\": " + geminiResponse + "\n" +
                "}";
    }

    private String getFallbackExamResponse(String courseId, String topic, int questionCount, String difficulty) {
        log.info("Generating fallback exam with {} questions for topic: {}", questionCount, topic);

        StringBuilder questions = new StringBuilder("[");
        for (int i = 1; i <= questionCount; i++) {
            if (i > 1)
                questions.append(", ");
            questions.append(String.format(
                    "{\"id\": \"Q%d\", \"questionText\": \"Sample %s level MCQ %d about %s?\", \"type\": \"MULTIPLE_CHOICE\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": 0, \"explanation\": \"Simulation mode: AI would generate a real question here.\"}",
                    i, difficulty, i, topic));
        }
        questions.append("]");

        return "{\n" +
                "  \"courseId\": \"" + courseId + "\",\n" +
                "  \"topic\": \"" + topic + "\",\n" +
                "  \"difficulty\": \"" + difficulty + "\",\n" +
                "  \"questions\": " + questions.toString() + "\n" +
                "}";
    }

    private String getFallbackDoubtResponse(String doubt, String topic) {
        return "{\n" +
                "  \"doubt\": \"" + doubt + "\",\n" +
                "  \"solution\": \"Solution for your doubt about " + topic + "\",\n" +
                "  \"explanation\": \"Detailed explanation provided\"\n" +
                "}";
    }

    private String getFallbackEvaluationResponse(double score, int totalQuestions, double percentage) {
        String level = percentage >= 80 ? "Excellent" : percentage >= 60 ? "Good" : "Needs Improvement";
        return "{\n" +
                "  \"score\": " + score + ",\n" +
                "  \"percentage\": " + String.format("%.2f", percentage) + ",\n" +
                "  \"performanceLevel\": \"" + level + "\"\n" +
                "}";
    }

    private String getFallbackContentResponse(String topic, String contentType) {
        return "{\n" +
                "  \"contentType\": \"" + contentType + "\",\n" +
                "  \"title\": \"" + topic + " - Learning Material\",\n" +
                "  \"description\": \"Comprehensive guide for " + topic + "\"\n" +
                "}";
    }

    private String getFallbackFeedbackResponse(double performanceScore, String improvementArea, String strengthArea) {
        return "{\n" +
                "  \"performanceScore\": " + performanceScore + ",\n" +
                "  \"improvementArea\": \"" + improvementArea + "\",\n" +
                "  \"strengthArea\": \"" + strengthArea + "\",\n" +
                "  \"recommendation\": \"Focus on improving " + improvementArea + "\"\n" +
                "}";
    }
}
