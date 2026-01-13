package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.service.CourseService;
import com.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/learner")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LearnerController {

    private final UserService userService;
    private final CourseService courseService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        try {
            var currentUser = userService.getCurrentUser();
            var enrolledCourses = courseService.getEnrolledCourses(currentUser.getId());

            Map<String, Object> stats = new HashMap<>();
            stats.put("enrolledCoursesCount", enrolledCourses.size());
            stats.put("activeCourses", enrolledCourses.size());
            stats.put("completedCourses", 0); // Placeholder
            stats.put("studyStreak", 15); // Placeholder
            stats.put("enrolledCourses", enrolledCourses);
            stats.put("totalHours", enrolledCourses.stream()
                    .mapToInt(course -> course.getEstimatedHours() != null ? course.getEstimatedHours() : 0)
                    .sum());

            return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
        } catch (Exception e) {
            log.error("Error fetching learner dashboard stats", e);
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("enrolledCoursesCount", 0);
            emptyStats.put("activeCourses", 0);
            emptyStats.put("completedCourses", 0);
            emptyStats.put("studyStreak", 0);
            emptyStats.put("enrolledCourses", java.util.Collections.emptyList());
            emptyStats.put("totalHours", 0);
            return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", emptyStats));
        }
    }
}
