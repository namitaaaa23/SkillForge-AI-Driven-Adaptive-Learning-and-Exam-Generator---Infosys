package com.skillforge.dto;

import com.skillforge.model.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultDTO {
    private String id;
    private String examId;
    private String userId;
    private Integer score;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Boolean passed;
    private Integer timeTakenMinutes;
    private LocalDateTime completedAt;

    public static ExamResultDTO fromEntity(ExamResult result) {
        ExamResultDTO dto = new ExamResultDTO();
        dto.setId(result.getId());
        dto.setExamId(result.getExamId());
        dto.setUserId(result.getUserId());
        dto.setScore(result.getScore());
        dto.setTotalQuestions(result.getTotalQuestions());
        dto.setCorrectAnswers(result.getCorrectAnswers());
        dto.setPassed(result.getPassed());
        dto.setTimeTakenMinutes(result.getTimeTakenMinutes());
        dto.setCompletedAt(result.getCompletedAt());
        return dto;
    }
}
