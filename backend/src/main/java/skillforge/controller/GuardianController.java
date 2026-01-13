package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.model.Course;
import com.skillforge.model.ExamResult;
import com.skillforge.model.StudentProgress;
import com.skillforge.model.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.ExamResultRepository;
import com.skillforge.repository.StudentProgressRepository;
import com.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/guardian")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GuardianController {

    private final UserService userService;
    private final ExamResultRepository examResultRepository;
    private final StudentProgressRepository studentProgressRepository;
    private final CourseRepository courseRepository;

    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<List<User>>> getWards() {
        try {
            User currentUser = userService.getCurrentUser();
            List<User> wards = userService.getWardsForGuardian(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Wards retrieved", wards));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/wards/{wardId}/progress")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWardProgress(@PathVariable String wardId) {
        try {
            User currentUser = userService.getCurrentUser();
            // Verify link security
            boolean isWard = userService.getWardsForGuardian(currentUser.getId()).stream()
                    .anyMatch(w -> w.getId().equals(wardId));

            if (!isWard) {
                return ResponseEntity.status(403).body(ApiResponse.error("Not authorized to view this ward"));
            }

            User ward = userService.getUserById(wardId);
            List<ExamResult> results = examResultRepository.findByUserIdOrderByCompletedAtDesc(wardId);
            List<StudentProgress> progresses = studentProgressRepository.findByStudentId(wardId);

            // Calculate stats
            double totalScore = results.stream().mapToInt(ExamResult::getScore).sum();
            double avgScore = results.isEmpty() ? 0 : totalScore / results.size();
            double gpa = (avgScore / 100) * 4.0; // Simple conversion

            double totalProgress = progresses.stream().mapToDouble(StudentProgress::getProgressPercentage).sum();
            double avgProgress = progresses.isEmpty() ? 0 : totalProgress / progresses.size();

            // If no progresses recorded but we have results, assume generic progress or
            // leave 0
            if (progresses.isEmpty() && !results.isEmpty()) {
                avgProgress = (double) results.size() * 5; // tiny heuristic: 5% per exam?
                if (avgProgress > 100)
                    avgProgress = 100;
            }

            long activeCourses = progresses.stream().filter(p -> p.getProgressPercentage() < 100).count();
            if (activeCourses == 0 && !results.isEmpty())
                activeCourses = 1; // Fallback

            long completedCourses = progresses.stream().filter(p -> p.getProgressPercentage() >= 100).count();

            // Recent grades
            List<Map<String, Object>> recentGrades = results.stream().limit(5).map(r -> {
                String courseName = "General Assessment";
                if (r.getCourseId() != null) {
                    courseName = courseRepository.findById(r.getCourseId())
                            .map(Course::getTitle)
                            .orElse("Unknown Course");
                }

                Map<String, Object> gradeMap = new HashMap<>();
                gradeMap.put("course", courseName);
                gradeMap.put("grade", calculateGrade(r.getScore()));
                gradeMap.put("score", r.getScore());
                return gradeMap;
            }).collect(Collectors.toList());

            // Fill map
            Map<String, Object> data = new HashMap<>();
            data.put("name", ward.getFullName());
            data.put("studentId", ward.getId());
            data.put("institution", "SkillForge Academy");
            data.put("grade", "Grade 10"); // Mock
            data.put("gpa", String.format("%.2f", gpa));
            data.put("progress", (int) avgProgress);
            data.put("rank", 12); // Mock for now
            data.put("activeCourses", activeCourses);
            data.put("completedCourses", completedCourses);
            data.put("studyStreak", 5); // Mock
            data.put("attendanceRate", 95); // Mock
            data.put("recentGrades", recentGrades);

            // Mock upcoming assessments for UI completeness
            data.put("upcomingAssessments", List.of(
                    Map.of("name", "Calculus Final", "date", "Dec 15", "type", "Exam"),
                    Map.of("name", "Physics Lab", "date", "Dec 18", "type", "Lab Report")));

            // Mock weekly activity for chart
            data.put("weeklyActivity", List.of(
                    Map.of("day", "Mon", "hours", 2.5),
                    Map.of("day", "Tue", "hours", 3.0),
                    Map.of("day", "Wed", "hours", 2.0),
                    Map.of("day", "Thu", "hours", 3.5),
                    Map.of("day", "Fri", "hours", 2.5),
                    Map.of("day", "Sat", "hours", 4.0),
                    Map.of("day", "Sun", "hours", 1.5)));

            return ResponseEntity.ok(ApiResponse.success("Ward progress retrieved", data));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String calculateGrade(int score) {
        if (score >= 90)
            return "A";
        if (score >= 80)
            return "B";
        if (score >= 70)
            return "C";
        if (score >= 60)
            return "D";
        return "F";
    }

    @GetMapping("/wards/{wardId}/attendance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWardAttendance(@PathVariable String wardId) {
        return ResponseEntity.ok(ApiResponse.success("Ward attendance retrieved", List.of()));
    }

    @GetMapping("/wards/{wardId}/grades")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getWardGrades(@PathVariable String wardId) {
        return ResponseEntity.ok(ApiResponse.success("Ward grades retrieved", List.of()));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMessages() {
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", List.of()));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMessage(@RequestBody Map<String, Object> messageData) {
        return ResponseEntity.ok(ApiResponse.success("Message sent", messageData));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", List.of()));
    }

    @PostMapping("/link-ward")
    public ResponseEntity<ApiResponse<Void>> linkWard(@RequestBody Map<String, String> request) {
        String studentEmail = request.get("email");
        if (studentEmail == null || studentEmail.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Student email is required"));
        }
        try {
            User currentUser = userService.getCurrentUser();
            userService.linkGuardianToWardByEmail(currentUser.getId(), studentEmail);
            return ResponseEntity.ok(ApiResponse.success("Ward linked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
