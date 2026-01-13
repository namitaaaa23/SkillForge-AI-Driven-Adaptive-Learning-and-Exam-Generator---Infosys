package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.model.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.ExamResultRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ExamResultRepository examResultRepository;
    private final AuditService auditService;

    @GetMapping("/admin/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminOverview() {
        long totalUsers = userRepository.count();
        long activeStudents = userRepository.findByRole(User.Role.STUDENT).stream()
                .filter(User::getActive)
                .count();
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.findByPublishedTrueAndActiveTrue().size();
        
        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "activeStudents", activeStudents,
                "totalCourses", totalCourses,
                "publishedCourses", publishedCourses,
                "courseCompletionRate", 76.5,
                "systemUptime", 99.99,
                "lastUpdated", System.currentTimeMillis()
        );
        return ResponseEntity.ok(ApiResponse.success("Admin analytics retrieved", stats));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        long totalUsers = userRepository.count();
        long admins = userRepository.findByRole(User.Role.ADMIN).size();
        long students = userRepository.findByRole(User.Role.STUDENT).size();
        long guardians = userRepository.findByRole(User.Role.GUARDIAN).size();
        long totalCourses = courseRepository.count();
        
        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "activeInstructors", admins,
                "totalStudents", students,
                "totalGuardians", guardians,
                "totalCourses", totalCourses,
                "averageCompletion", 76.5,
                "systemHealth", 99.99,
                "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(ApiResponse.success("Admin statistics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserAnalytics() {
        long totalUsers = userRepository.count();
        long students = userRepository.findByRole(User.Role.STUDENT).size();
        long admins = userRepository.findByRole(User.Role.ADMIN).size();
        long guardians = userRepository.findByRole(User.Role.GUARDIAN).size();
        long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getActive())
                .count();
        
        Map<String, Object> analytics = Map.of(
                "totalUsers", totalUsers,
                "students", students,
                "instructors", admins,
                "guardians", guardians,
                "activeUsers", activeUsers,
                "inactiveUsers", totalUsers - activeUsers,
                "newUsersThisMonth", 125,
                "userGrowthRate", 12.5
        );
        return ResponseEntity.ok(ApiResponse.success("User analytics retrieved", analytics));
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourseAnalytics() {
        long totalCourses = courseRepository.count();
        long publishedCourses = courseRepository.findByPublishedTrueAndActiveTrue().size();
        long draftCourses = totalCourses - publishedCourses;
        
        Map<String, Object> analytics = Map.of(
                "totalCourses", totalCourses,
                "publishedCourses", publishedCourses,
                "draftCourses", draftCourses,
                "totalEnrollments", 2150,
                "averageEnrollment", totalCourses > 0 ? 2150 / totalCourses : 0,
                "completionRate", 76.5,
                "averageRating", 4.5
        );
        return ResponseEntity.ok(ApiResponse.success("Course analytics retrieved", analytics));
    }

    @GetMapping("/exams")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExamAnalytics() {
        long totalExams = examResultRepository.count();
        long passedExams = examResultRepository.findAll().stream()
                .filter(r -> r.getPassed())
                .count();
        long failedExams = totalExams - passedExams;
        
        double avgScore = examResultRepository.findAll().stream()
                .mapToInt(r -> r.getScore())
                .average()
                .orElse(0);
        
        Map<String, Object> analytics = Map.of(
                "totalExams", totalExams,
                "passedExams", passedExams,
                "failedExams", failedExams,
                "passRate", totalExams > 0 ? (passedExams * 100.0 / totalExams) : 0,
                "averageScore", avgScore,
                "highestScore", 100,
                "lowestScore", 0
        );
        return ResponseEntity.ok(ApiResponse.success("Exam analytics retrieved", analytics));
    }

    @GetMapping("/growth")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGrowthAnalytics() {
        List<Map<String, Object>> growth = Arrays.asList(
                Map.of("month", "January", "users", 450, "courses", 12, "revenue", 5000),
                Map.of("month", "February", "users", 620, "courses", 15, "revenue", 7500),
                Map.of("month", "March", "users", 850, "courses", 20, "revenue", 10000),
                Map.of("month", "April", "users", 1050, "courses", 28, "revenue", 12500),
                Map.of("month", "May", "users", 1250, "courses", 35, "revenue", 15000)
        );
        return ResponseEntity.ok(ApiResponse.success("Growth analytics retrieved", growth));
    }

    @GetMapping("/engagement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEngagementAnalytics() {
        Map<String, Object> engagement = Map.of(
                "dailyActiveUsers", 450,
                "weeklyActiveUsers", 850,
                "monthlyActiveUsers", 1200,
                "averageSessionDuration", "45 minutes",
                "bounceRate", 12.5,
                "returnUserRate", 78.5,
                "engagementScore", 8.2
        );
        return ResponseEntity.ok(ApiResponse.success("Engagement analytics retrieved", engagement));
    }

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceAnalytics() {
        Map<String, Object> performance = Map.of(
                "pageLoadTime", "1.2s",
                "apiResponseTime", "250ms",
                "databaseQueryTime", "150ms",
                "cacheHitRate", 85.5,
                "errorRate", 0.5,
                "uptime", 99.99,
                "cpuUsage", 45.2,
                "memoryUsage", 62.8
        );
        return ResponseEntity.ok(ApiResponse.success("Performance analytics retrieved", performance));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<Map<String, Object>> logs = Arrays.asList(
                Map.of("id", 1, "user", "admin@example.com", "action", "CREATE_COURSE", "timestamp", "2 hours ago"),
                Map.of("id", 2, "user", "teacher@example.com", "action", "UPDATE_EXAM", "timestamp", "3 hours ago"),
                Map.of("id", 3, "user", "student@example.com", "action", "SUBMIT_EXAM", "timestamp", "4 hours ago")
        );
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenueAnalytics() {
        Map<String, Object> revenue = Map.of(
                "totalRevenue", 45000.00,
                "monthlyRevenue", 15000.00,
                "weeklyRevenue", 3500.00,
                "averageTransactionValue", 125.50,
                "topCourse", "Advanced Mathematics",
                "topCourseRevenue", 5000.00
        );
        return ResponseEntity.ok(ApiResponse.success("Revenue analytics retrieved", revenue));
    }
}
