package com.skillforge.dto;

import com.skillforge.model.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private String id;
    private String questionText;
    private Question.QuestionType questionType;
    private List<String> options;
    private List<String> correctAnswers;
    private Integer points;
    private String explanation;
    private String examId;

    public static QuestionDTO fromEntity(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setOptions(question.getOptions());
        dto.setCorrectAnswers(question.getCorrectAnswers());
        dto.setPoints(question.getPoints());
        dto.setExplanation(question.getExplanation());
        dto.setExamId(question.getExamId());
        return dto;
    }
}
