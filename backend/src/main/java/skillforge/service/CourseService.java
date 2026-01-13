package com.skillforge.service;

import com.skillforge.dto.CourseDTO;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.exception.UnauthorizedException;
import com.skillforge.model.Course;
import com.skillforge.model.User;
import com.skillforge.repository.CourseRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final com.skillforge.repository.LearningContentRepository learningContentRepository;

    public List<CourseDTO> getAllPublishedCourses() {
        return courseRepository.findByPublishedTrueAndActiveTrue().stream()
                .map(CourseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(CourseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getEnrolledCourses(String userId) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getEnrolledUserIds().contains(userId))
                .map(CourseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByInstructor(String instructorId) {
        return courseRepository.findByInstructorId(instructorId).stream()
                .map(CourseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(@NonNull String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return CourseDTO.fromEntity(course);
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        User currentUser = userService.getCurrentUser();

        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only admins can create courses");
        }

        Course course = new Course();
        course.setTitle(courseDTO.getTitle());
        course.setDescription(courseDTO.getDescription());
        course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        course.setDifficultyLevel(courseDTO.getDifficultyLevel() != null ? courseDTO.getDifficultyLevel()
                : Course.DifficultyLevel.BEGINNER);
        course.setEstimatedHours(courseDTO.getEstimatedHours() != null ? courseDTO.getEstimatedHours() : 0);
        course.setPublished(courseDTO.getPublished() != null ? courseDTO.getPublished() : false);
        course.setActive(true);
        course.setInstructorId(currentUser.getId());

        course = courseRepository.save(course);
        log.info("Course created: {} by admin: {}", course.getTitle(), currentUser.getEmail());
        auditService.logAction(currentUser.getUsername(), "CREATE_COURSE", "Created course: " + course.getTitle(),
                "UNKNOWN");
        return CourseDTO.fromEntity(course);
    }

    @Transactional
    public CourseDTO updateCourse(@NonNull String id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        User currentUser = userService.getCurrentUser();
        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to update this course");
        }

        if (courseDTO.getTitle() != null)
            course.setTitle(courseDTO.getTitle());
        if (courseDTO.getDescription() != null)
            course.setDescription(courseDTO.getDescription());
        if (courseDTO.getThumbnailUrl() != null)
            course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        if (courseDTO.getDifficultyLevel() != null)
            course.setDifficultyLevel(courseDTO.getDifficultyLevel());
        if (courseDTO.getEstimatedHours() != null)
            course.setEstimatedHours(courseDTO.getEstimatedHours());
        if (courseDTO.getPublished() != null)
            course.setPublished(courseDTO.getPublished());

        course = courseRepository.save(course);
        log.info("Course updated: {} by user: {}", course.getTitle(), currentUser.getEmail());
        auditService.logAction(currentUser.getUsername(), "UPDATE_COURSE", "Updated course: " + course.getTitle(),
                "UNKNOWN");
        return CourseDTO.fromEntity(course);
    }

    @Transactional
    public void deleteCourse(@NonNull String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        User currentUser = userService.getCurrentUser();
        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete this course");
        }

        courseRepository.delete(course);
        log.info("Course deleted: {} by user: {}", course.getTitle(), currentUser.getEmail());
        auditService.logAction(currentUser.getUsername(), "DELETE_COURSE", "Deleted course: " + course.getTitle(),
                "UNKNOWN");
    }

    @Transactional
    public CourseDTO enrollInCourse(@NonNull String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User currentUser = userService.getCurrentUser();

        if (!course.getEnrolledUserIds().contains(currentUser.getId())) {
            course.getEnrolledUserIds().add(currentUser.getId());
            course = courseRepository.save(course);
            log.info("User {} enrolled in course {}", currentUser.getEmail(), course.getTitle());
        }

        return CourseDTO.fromEntity(course);
    }

    @Transactional
    public CourseDTO addCourseMaterial(@NonNull String courseId, com.skillforge.dto.CourseMaterialDTO materialDTO) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User currentUser = userService.getCurrentUser();
        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to add content to this course");
        }

        com.skillforge.model.LearningContent content = new com.skillforge.model.LearningContent();
        content.setCourseId(courseId);
        content.setTitle(materialDTO.getTitle());
        content.setDescription(materialDTO.getTextContent()); // Mapping textContent to description/body
        content.setTextContent(materialDTO.getTextContent());
        content.setContentUrl(materialDTO.getContentUrl());

        try {
            content.setContentType(com.skillforge.model.LearningContent.ContentType.valueOf(materialDTO.getType()));
        } catch (IllegalArgumentException e) {
            // Fallback or default
            content.setContentType(com.skillforge.model.LearningContent.ContentType.ADMIN_UPLOADED);
        }

        content.setCreatedBy(currentUser.getId());
        content.setPublished(true); // Auto-publish for now or use DTO flag

        content = learningContentRepository.save(content);

        course.getMaterialIds().add(content.getId());
        course = courseRepository.save(course);

        auditService.logAction(currentUser.getUsername(), "ADD_MATERIAL",
                "Added material " + materialDTO.getTitle() + " to course " + course.getTitle(), "UNKNOWN");

        return CourseDTO.fromEntity(course);
    }

    @Transactional
    public void deleteCourseMaterial(@NonNull String courseId, @NonNull String materialId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User currentUser = userService.getCurrentUser();
        if (!course.getInstructorId().equals(currentUser.getId()) &&
                currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("You don't have permission to delete content from this course");
        }

        boolean removed = course.getMaterialIds().remove(materialId);

        if (!removed) {
            throw new ResourceNotFoundException("Material ID not found in course list: " + materialId);
        }

        // Delete the actual learning content document
        learningContentRepository.deleteById(materialId);

        courseRepository.save(course);
        log.info("Material {} deleted from course {} by user: {}", materialId, course.getTitle(),
                currentUser.getEmail());
        auditService.logAction(currentUser.getUsername(), "DELETE_MATERIAL",
                "Deleted material " + materialId + " from course " + course.getTitle(), "UNKNOWN");
    }

    @Transactional
    public CourseDTO assignCourseToLearners(@NonNull String courseId, List<String> learnerEmails) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        User currentUser = userService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Only admins can assign courses to learners");
        }

        // Add new emails to the assigned list (avoiding duplicates)
        for (String email : learnerEmails) {
            if (!course.getAssignedLearnerEmails().contains(email)) {
                course.getAssignedLearnerEmails().add(email);
            }
        }

        course.setAssignmentType("ADMIN_ASSIGNED");
        course = courseRepository.save(course);

        log.info("Course {} assigned to {} learners by admin {}", course.getTitle(), learnerEmails.size(),
                currentUser.getEmail());
        auditService.logAction(currentUser.getUsername(), "ASSIGN_COURSE",
                "Assigned course " + course.getTitle() + " to learners", "UNKNOWN");

        return CourseDTO.fromEntity(course);
    }

    public List<CourseDTO> getCoursesAssignedToUser(String userEmail) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getAssignedLearnerEmails().contains(userEmail))
                .map(CourseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
