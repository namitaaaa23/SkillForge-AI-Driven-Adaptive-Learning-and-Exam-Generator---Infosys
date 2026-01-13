package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.dto.CourseDTO;
import com.skillforge.service.CourseService;
import com.skillforge.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAllPublishedCourses() {
        List<CourseDTO> courses = courseService.getAllPublishedCourses();
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getAllCoursesForAdmin() {
        List<CourseDTO> courses = courseService.getAllCourses();
        return ResponseEntity.ok(ApiResponse.success("All courses retrieved successfully", courses));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getMyCourses() {
        var currentUser = userService.getCurrentUser();
        List<CourseDTO> courses = courseService.getEnrolledCourses(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("My courses retrieved successfully", courses));
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getCoursesByInstructor(@PathVariable String instructorId) {
        List<CourseDTO> courses = courseService.getCoursesByInstructor(instructorId);
        return ResponseEntity.ok(ApiResponse.success("Instructor courses retrieved successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> getCourseById(@PathVariable String id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", course));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseDTO>> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        CourseDTO created = courseService.createCourse(courseDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDTO>> updateCourse(
            @PathVariable String id,
            @Valid @RequestBody CourseDTO courseDTO) {
        CourseDTO updated = courseService.updateCourse(id, courseDTO);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<CourseDTO>> publishCourse(@PathVariable String id) {
        CourseDTO course = courseService.getCourseById(id);
        course.setPublished(true);
        CourseDTO updated = courseService.updateCourse(id, course);
        return ResponseEntity.ok(ApiResponse.success("Course published successfully", updated));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<CourseDTO>> unpublishCourse(@PathVariable String id) {
        CourseDTO course = courseService.getCourseById(id);
        course.setPublished(false);
        CourseDTO updated = courseService.updateCourse(id, course);
        return ResponseEntity.ok(ApiResponse.success("Course unpublished successfully", updated));
    }

    @PostMapping("/{id}/materials")
    public ResponseEntity<ApiResponse<CourseDTO>> addCourseMaterial(
            @PathVariable String id,
            @Valid @RequestBody com.skillforge.dto.CourseMaterialDTO materialDTO) {
        CourseDTO updatedCourse = courseService.addCourseMaterial(id, materialDTO);
        return ResponseEntity.ok(ApiResponse.success("Course material added successfully", updatedCourse));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<ApiResponse<CourseDTO>> enrollInCourse(@PathVariable String id) {
        CourseDTO enrolledCourse = courseService.enrollInCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Enrolled in course successfully", enrolledCourse));
    }

    @DeleteMapping("/{courseId}/materials/{materialId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseMaterial(
            @PathVariable String courseId,
            @PathVariable String materialId) {
        courseService.deleteCourseMaterial(courseId, materialId);
        return ResponseEntity.ok(ApiResponse.success("Material deleted successfully", null));
    }

    @GetMapping("/{courseId}/students")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEnrolledStudents(@PathVariable String courseId) {
        List<Map<String, Object>> students = List.of(
                Map.of("id", 1, "name", "John Doe", "email", "john@example.com", "enrolledDate", "2024-01-15"),
                Map.of("id", 2, "name", "Jane Smith", "email", "jane@example.com", "enrolledDate", "2024-01-20"),
                Map.of("id", 3, "name", "Alex Johnson", "email", "alex@example.com", "enrolledDate", "2024-02-01"));
        return ResponseEntity.ok(ApiResponse.success("Enrolled students retrieved", students));
    }

    @PostMapping("/{id}/assign-learners")
    public ResponseEntity<ApiResponse<CourseDTO>> assignCourseToLearners(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> request) {
        List<String> learnerEmails = request.get("learnerEmails");
        CourseDTO updatedCourse = courseService.assignCourseToLearners(id, learnerEmails);
        return ResponseEntity.ok(ApiResponse.success("Course assigned to learners successfully", updatedCourse));
    }

    @GetMapping("/assigned-to-me")
    public ResponseEntity<ApiResponse<List<CourseDTO>>> getCoursesAssignedToMe() {
        var currentUser = userService.getCurrentUser();
        List<CourseDTO> courses = courseService.getCoursesAssignedToUser(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Assigned courses retrieved successfully", courses));
    }
}
