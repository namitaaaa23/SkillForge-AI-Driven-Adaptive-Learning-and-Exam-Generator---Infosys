package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.dto.ExamDTO;
import com.skillforge.dto.ExamResultDTO;
import com.skillforge.dto.QuestionDTO;
import com.skillforge.service.ExamService;
import com.skillforge.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamService examService;
    private final UserService userService;

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getExamsByCourse(@PathVariable String courseId) {
        List<ExamDTO> exams = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", exams));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDTO>> getExamById(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean includeAnswers) {
        ExamDTO exam = examService.getExamById(id, includeAnswers);
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", exam));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamDTO>> createExam(@Valid @RequestBody ExamDTO examDTO) {
        ExamDTO created = examService.createExam(examDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exam created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDTO>> updateExam(
            @PathVariable String id,
            @Valid @RequestBody ExamDTO examDTO) {
        ExamDTO updated = examService.updateExam(id, examDTO);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<ExamDTO>> publishExam(@PathVariable String id) {
        ExamDTO exam = examService.getExamById(id, false);
        exam.setPublished(true);
        ExamDTO updated = examService.updateExam(id, exam);
        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", updated));
    }

    @PostMapping("/{examId}/questions")
    public ResponseEntity<ApiResponse<QuestionDTO>> addQuestion(
            @PathVariable String examId,
            @Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO created = examService.addQuestion(examId, questionDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question added successfully", created));
    }

    @PostMapping("/{examId}/submit")
    public ResponseEntity<ApiResponse<ExamResultDTO>> submitExam(
            @PathVariable String examId,
            @RequestBody List<QuestionDTO> answers) {
        ExamResultDTO result = examService.submitExam(examId, answers);
        return ResponseEntity.ok(ApiResponse.success("Exam submitted successfully", result));
    }

    @GetMapping("/{examId}/results")
    public ResponseEntity<ApiResponse<List<ExamResultDTO>>> getExamResults(@PathVariable String examId) {
        List<ExamResultDTO> results = examService.getExamResults(examId);
        return ResponseEntity.ok(ApiResponse.success("Exam results retrieved successfully", results));
    }

    @GetMapping("/my-results")
    public ResponseEntity<ApiResponse<List<ExamResultDTO>>> getMyExamResults() {
        var currentUser = userService.getCurrentUser();
        List<ExamResultDTO> results = examService.getUserExamResults(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("My exam results retrieved successfully", results));
    }

    @GetMapping("/users/{userId}/results")
    public ResponseEntity<ApiResponse<List<ExamResultDTO>>> getUserExamResults(@PathVariable String userId) {
        List<ExamResultDTO> results = examService.getUserExamResults(userId);
        return ResponseEntity.ok(ApiResponse.success("User exam results retrieved successfully", results));
    }
}
