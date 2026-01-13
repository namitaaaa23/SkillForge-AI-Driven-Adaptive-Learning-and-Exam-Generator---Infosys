package com.skillforge.service;

import com.skillforge.dto.ExamDTO;
import com.skillforge.dto.ExamResultDTO;
import com.skillforge.dto.QuestionDTO;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.exception.UnauthorizedException;
import com.skillforge.model.*;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.ExamResultRepository;
import com.skillforge.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamResultRepository examResultRepository;
    private final CourseRepository courseRepository;
    private final UserService userService;

    public List<ExamDTO> getExamsByCourse(String courseId) {
        return examRepository.findByCourseIdAndPublishedTrueAndActiveTrue(courseId).stream()
                .map(exam -> ExamDTO.fromEntity(exam, false))
                .collect(Collectors.toList());
    }

    public ExamDTO getExamById(String id, boolean includeAnswers) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        ExamDTO dto = ExamDTO.fromEntity(exam, includeAnswers);
        
        List<Question> questions = questionRepository.findByExamId(id);
        dto.setQuestions(questions.stream()
                .map(QuestionDTO::fromEntity)
                .collect(Collectors.toList()));
        
        // Optionally remove answers if not requested
        if (!includeAnswers) {
            dto.getQuestions().forEach(q -> q.setCorrectAnswers(null));
        }
        
        return dto;
    }

    @Transactional
    public ExamDTO createExam(ExamDTO examDTO) {
        User currentUser = userService.getCurrentUser();
        log.info("Attempting to create exam: {} for courseId: {}", examDTO.getTitle(), examDTO.getCourseId());

        Exam exam = new Exam();
        exam.setTitle(examDTO.getTitle());
        exam.setDescription(examDTO.getDescription());
        exam.setDurationMinutes(examDTO.getDurationMinutes() != null ? examDTO.getDurationMinutes() : 60);
        exam.setTotalQuestions(0);
        exam.setPassingScore(examDTO.getPassingScore() != null ? examDTO.getPassingScore() : 70);
        exam.setActive(true);

        // Special case for AI Generated / Practice Exams
        String courseIdStr = examDTO.getCourseId();
        if (courseIdStr == null || "General".equalsIgnoreCase(courseIdStr.trim())) {
            exam.setCourseId("General");
            exam.setPublished(true);
            exam.setDescription(
                    examDTO.getDescription() != null ? examDTO.getDescription() : "AI Generated Assessment");
        } else {
            Course course = courseRepository.findById(courseIdStr)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseIdStr));

            if (!course.getInstructorId().equals(currentUser.getId()) &&
                    currentUser.getRole() != User.Role.ADMIN) {
                throw new UnauthorizedException("You don't have permission to create exams for this course");
            }
            exam.setCourseId(course.getId());
            exam.setPublished(examDTO.getPublished() != null ? examDTO.getPublished() : false);
        }

        exam = examRepository.save(exam);

        // Handle bulk questions if present
        if (examDTO.getQuestions() != null && !examDTO.getQuestions().isEmpty()) {
            final String finalExamId = exam.getId();
            List<Question> questions = examDTO.getQuestions().stream().map(qDto -> {
                Question q = new Question();
                q.setQuestionText(qDto.getQuestionText());
                q.setQuestionType(qDto.getQuestionType() != null ? qDto.getQuestionType()
                        : Question.QuestionType.MULTIPLE_CHOICE);
                q.setOptions(qDto.getOptions());
                q.setCorrectAnswers(qDto.getCorrectAnswers());
                q.setPoints(qDto.getPoints() != null ? qDto.getPoints() : 1);
                q.setExplanation(qDto.getExplanation());
                q.setExamId(finalExamId);
                return q;
            }).collect(Collectors.toList());

            questions = (List<Question>) questionRepository.saveAll(questions);
            exam.setQuestionIds(questions.stream().map(Question::getId).collect(Collectors.toList()));
            exam.setTotalQuestions(questions.size());
            exam = examRepository.save(exam);
        }

        log.info("Exam created: {} (ID: {}) for course: {} by user: {}", exam.getTitle(), exam.getId(),
                exam.getCourseId(), currentUser.getEmail());
        return ExamDTO.fromEntity(exam, false);
    }

    @Transactional
    public ExamDTO updateExam(String id, ExamDTO examDTO) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        Course course = courseRepository.findById(exam.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        User currentUser = userService.getCurrentUser();

        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to update this exam");
        }

        if (examDTO.getTitle() != null)
            exam.setTitle(examDTO.getTitle());
        if (examDTO.getDescription() != null)
            exam.setDescription(examDTO.getDescription());
        if (examDTO.getDurationMinutes() != null)
            exam.setDurationMinutes(examDTO.getDurationMinutes());
        if (examDTO.getPassingScore() != null)
            exam.setPassingScore(examDTO.getPassingScore());
        if (examDTO.getPublished() != null)
            exam.setPublished(examDTO.getPublished());

        exam = examRepository.save(exam);
        log.info("Exam updated: {} by user: {}", exam.getTitle(), currentUser.getEmail());
        return ExamDTO.fromEntity(exam, true);
    }

    @Transactional
    public void deleteExam(String id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        Course course = courseRepository.findById(exam.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        User currentUser = userService.getCurrentUser();

        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this exam");
        }

        examRepository.delete(exam);
        log.info("Exam deleted: {} by user: {}", exam.getTitle(), currentUser.getEmail());
    }

    @Transactional
    public QuestionDTO addQuestion(String examId, QuestionDTO questionDTO) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        User currentUser = userService.getCurrentUser();

        // Skip course permission check for AI/General exams
        if (!"General".equals(exam.getCourseId())) {
            Course course = courseRepository.findById(exam.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

            if (!course.getInstructorId().equals(currentUser.getId()) &&
                    currentUser.getRole() != User.Role.ADMIN) {
                throw new UnauthorizedException("You don't have permission to add questions to this exam");
            }
        }

        Question question = new Question();
        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionType(questionDTO.getQuestionType() != null ? questionDTO.getQuestionType()
                : Question.QuestionType.MULTIPLE_CHOICE);
        question.setOptions(questionDTO.getOptions());
        question.setCorrectAnswers(questionDTO.getCorrectAnswers());
        question.setPoints(questionDTO.getPoints() != null ? questionDTO.getPoints() : 1);
        question.setExplanation(questionDTO.getExplanation());
        question.setExamId(examId);

        question = questionRepository.save(question);
        exam.getQuestionIds().add(question.getId());
        exam.setTotalQuestions(exam.getQuestionIds().size());
        examRepository.save(exam);

        log.info("Question added to exam: {} by user: {}", exam.getTitle(), currentUser.getEmail());
        return QuestionDTO.fromEntity(question);
    }

    @Transactional
    public ExamResultDTO submitExam(String examId, List<QuestionDTO> answers) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        User currentUser = userService.getCurrentUser();

        List<Question> questions = questionRepository.findByExamId(examId);
        int correctAnswers = 0;
        int totalQuestions = questions.size();
        int totalPoints = 0;
        int earnedPoints = 0;

        for (Question question : questions) {
            totalPoints += question.getPoints();

            QuestionDTO submittedAnswer = answers.stream()
                    .filter(a -> a.getId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            if (submittedAnswer != null && submittedAnswer.getCorrectAnswers() != null) {
                List<String> submitted = submittedAnswer.getCorrectAnswers();
                List<String> correct = question.getCorrectAnswers();

                if (submitted.size() == correct.size() &&
                        submitted.containsAll(correct) &&
                        correct.containsAll(submitted)) {
                    correctAnswers++;
                    earnedPoints += question.getPoints();
                }
            }
        }

        int score = totalQuestions > 0 ? (earnedPoints * 100) / totalPoints : 0;
        boolean passed = score >= exam.getPassingScore();

        ExamResult result = new ExamResult();
        result.setExamId(examId);
        result.setUserId(currentUser.getId());
        result.setScore(score);
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setPassed(passed);
        result.setCompletedAt(LocalDateTime.now());

        result = examResultRepository.save(result);
        log.info("Exam submitted: {} by user: {} - Score: {}% ({})",
                exam.getTitle(), currentUser.getEmail(), score, passed ? "PASSED" : "FAILED");

        return ExamResultDTO.fromEntity(result);
    }

    public List<ExamResultDTO> getExamResults(String examId) {
        User currentUser = userService.getCurrentUser();
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        Course course = courseRepository.findById(exam.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getInstructorId().equals(currentUser.getId()) ||
                currentUser.getRole() == User.Role.ADMIN) {
            return examResultRepository.findByExamId(examId).stream()
                    .map(ExamResultDTO::fromEntity)
                    .collect(Collectors.toList());
        }

        return examResultRepository.findByExamIdAndUserId(examId, currentUser.getId())
                .stream()
                .map(ExamResultDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ExamResultDTO> getUserExamResults(String userId) {
        User currentUser = userService.getCurrentUser();

        if (!currentUser.getId().equals(userId) && currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to view these results");
        }

        return examResultRepository.findByUserIdOrderByCompletedAtDesc(userId).stream()
                .map(ExamResultDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
