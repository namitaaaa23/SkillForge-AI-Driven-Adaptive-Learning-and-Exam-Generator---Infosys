package com.skillforge.service;

import com.skillforge.model.StudentProgress;
import com.skillforge.repository.StudentProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StudentProgressService {
    @Autowired
    private StudentProgressRepository studentProgressRepository;

    public StudentProgress initializeProgress(String studentId, String courseId, int totalLessons) {
        StudentProgress progress = new StudentProgress();
        progress.setStudentId(studentId);
        progress.setCourseId(courseId);
        progress.setTotalLessons(totalLessons);
        progress.setCompletedLessons(0);
        progress.setProgressPercentage(0);
        progress.setCurrentLevel("BEGINNER");
        return studentProgressRepository.save(progress);
    }

    public StudentProgress updateLessonCompletion(String studentId, String courseId, String lessonId, double score) {
        Optional<StudentProgress> progress = studentProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
        if (progress.isPresent()) {
            StudentProgress updated = progress.get();
            StudentProgress.LessonProgress lesson = new StudentProgress.LessonProgress(lessonId);
            lesson.completed = true;
            lesson.score = score;
            lesson.completedAt = LocalDateTime.now();
            updated.getLessonProgress().put(lessonId, lesson);
            
            int completed = (int) updated.getLessonProgress().values().stream()
                    .filter(l -> l.completed).count();
            updated.setCompletedLessons(completed);
            updated.setProgressPercentage((double) completed / updated.getTotalLessons() * 100);
            updated.setLastAccessedAt(LocalDateTime.now());
            updated.setUpdatedAt(LocalDateTime.now());
            
            return studentProgressRepository.save(updated);
        }
        return null;
    }

    public void updateStudentRanks(String courseId) {
        List<StudentProgress> allProgress = studentProgressRepository.findByCourseIdOrderByOverallScoreDesc(courseId);
        for (int i = 0; i < allProgress.size(); i++) {
            StudentProgress progress = allProgress.get(i);
            progress.setStudentRank(i + 1);
            studentProgressRepository.save(progress);
        }
    }

    public Optional<StudentProgress> getProgress(String studentId, String courseId) {
        return studentProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public List<StudentProgress> getStudentAllProgress(String studentId) {
        return studentProgressRepository.findByStudentId(studentId);
    }

    public List<StudentProgress> getCourseRankings(String courseId) {
        return studentProgressRepository.findByCourseIdOrderByOverallScoreDesc(courseId);
    }
}
