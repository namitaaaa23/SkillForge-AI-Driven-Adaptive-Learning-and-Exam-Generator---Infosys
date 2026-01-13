package com.skillforge.dto;

import com.skillforge.model.CourseRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequestDTO {
    private String id;
    private String learnerId;
    private String learnerEmail;
    private String learnerName;
    private String courseName;
    private String courseDescription;
    private String reason;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private String adminResponse;

    public static CourseRequestDTO fromEntity(CourseRequest request) {
        CourseRequestDTO dto = new CourseRequestDTO();
        dto.setId(request.getId());
        dto.setLearnerId(request.getLearnerId());
        dto.setLearnerEmail(request.getLearnerEmail());
        dto.setLearnerName(request.getLearnerName());
        dto.setCourseName(request.getCourseName());
        dto.setCourseDescription(request.getCourseDescription());
        dto.setReason(request.getReason());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setRespondedAt(request.getRespondedAt());
        dto.setAdminResponse(request.getAdminResponse());
        return dto;
    }
}
