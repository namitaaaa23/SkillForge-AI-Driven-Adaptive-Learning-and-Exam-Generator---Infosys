package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.dto.CourseRequestDTO;
import com.skillforge.service.CourseRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/course-requests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CourseRequestController {
    private final CourseRequestService courseRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<CourseRequestDTO>> createRequest(@RequestBody CourseRequestDTO requestDTO) {
        CourseRequestDTO created = courseRequestService.createCourseRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course request submitted successfully", created));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<ApiResponse<List<CourseRequestDTO>>> getMyRequests() {
        List<CourseRequestDTO> requests = courseRequestService.getMyRequests();
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", requests));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<CourseRequestDTO>>> getAllRequests() {
        List<CourseRequestDTO> requests = courseRequestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success("All requests retrieved successfully", requests));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<CourseRequestDTO>>> getPendingRequests() {
        List<CourseRequestDTO> requests = courseRequestService.getPendingRequests();
        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved successfully", requests));
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<ApiResponse<CourseRequestDTO>> respondToRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> response) {
        String status = response.get("status");
        String adminResponse = response.get("adminResponse");

        CourseRequestDTO updated = courseRequestService.respondToRequest(id, status, adminResponse);
        return ResponseEntity.ok(ApiResponse.success("Request updated successfully", updated));
    }
}
