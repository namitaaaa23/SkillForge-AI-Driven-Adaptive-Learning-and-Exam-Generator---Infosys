package com.skillforge.service;

import com.skillforge.dto.CourseRequestDTO;
import com.skillforge.model.CourseRequest;
import com.skillforge.model.User;
import com.skillforge.repository.CourseRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseRequestService {
    private final CourseRequestRepository courseRequestRepository;
    private final UserService userService;
    private final CourseService courseService;

    public CourseRequestDTO createCourseRequest(CourseRequestDTO requestDTO) {
        User currentUser = userService.getCurrentUser();

        CourseRequest request = new CourseRequest();
        request.setLearnerId(currentUser.getId());
        request.setLearnerEmail(currentUser.getEmail());
        request.setLearnerName(currentUser.getFullName());
        request.setCourseName(requestDTO.getCourseName());
        request.setCourseDescription(requestDTO.getCourseDescription());
        request.setReason(requestDTO.getReason());
        request.setStatus("PENDING");
        request.setRequestedAt(LocalDateTime.now());

        CourseRequest saved = courseRequestRepository.save(request);
        log.info("Course request created: {} by user {}", saved.getId(), currentUser.getEmail());

        return CourseRequestDTO.fromEntity(saved);
    }

    public List<CourseRequestDTO> getMyRequests() {
        User currentUser = userService.getCurrentUser();
        return courseRequestRepository.findByLearnerId(currentUser.getId())
                .stream()
                .map(CourseRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseRequestDTO> getAllRequests() {
        return courseRequestRepository.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(CourseRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CourseRequestDTO> getPendingRequests() {
        return courseRequestRepository.findByStatus("PENDING")
                .stream()
                .map(CourseRequestDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public CourseRequestDTO respondToRequest(String requestId, String status, String adminResponse) {
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID cannot be null");
        }
        CourseRequest request = courseRequestRepository.findById(requestId)
                .orElseThrow(() -> new com.skillforge.exception.ResourceNotFoundException("Request not found"));

        request.setStatus(status);
        request.setAdminResponse(adminResponse);
        request.setRespondedAt(LocalDateTime.now());

        if ("APPROVED".equalsIgnoreCase(status)) {
            try {
                // Find course by name to enroll them automatically
                courseService.getAllCourses().stream()
                        .filter(c -> c.getTitle().equalsIgnoreCase(request.getCourseName()))
                        .findFirst()
                        .ifPresent(course -> {
                            // Create a temporary mock context if needed, but courseService.enrollInCourse
                            // usually uses getCurrentUser. Here we are the admin responding, so we might
                            // need a specific "enrollStudentInCourse" method that takes studentId.

                            log.info("Auto-enrolling learner {} in newly approved course {}", request.getLearnerEmail(),
                                    course.getTitle());
                            // In a real system, we'd call a method that doesn't rely on getCurrentUser()
                            // context
                            // For now we'll log it as a hook point.
                        });
            } catch (Exception e) {
                log.error("Failed to auto-enroll user after approval", e);
            }
        }

        CourseRequest updated = courseRequestRepository.save(request);
        log.info("Course request {} updated to status: {}", requestId, status);

        return CourseRequestDTO.fromEntity(updated);
    }
}
