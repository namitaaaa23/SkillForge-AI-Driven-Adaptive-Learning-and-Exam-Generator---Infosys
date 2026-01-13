package com.skillforge.dto;

import com.skillforge.model.Exam;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
    private String id;
    private String title;
    private String description;
    private String courseId;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private Integer passingScore;
    private Boolean active;
    private Boolean published;
    private List<String> questionIds;
    private List<QuestionDTO> questions;

    public static ExamDTO fromEntity(Exam exam, boolean includeAnswers) {
        ExamDTO dto = new ExamDTO();
        dto.setId(exam.getId());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setCourseId(exam.getCourseId());
        dto.setDurationMinutes(exam.getDurationMinutes());
        dto.setTotalQuestions(exam.getTotalQuestions());
        dto.setPassingScore(exam.getPassingScore());
        dto.setActive(exam.getActive());
        dto.setPublished(exam.getPublished());
        dto.setQuestionIds(exam.getQuestionIds());
        return dto;
    }
}
