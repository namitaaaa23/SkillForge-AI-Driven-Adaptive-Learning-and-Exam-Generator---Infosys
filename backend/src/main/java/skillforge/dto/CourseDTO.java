package com.skillforge.dto;

import com.skillforge.model.Course;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private String id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private Course.DifficultyLevel difficultyLevel;
    private Integer estimatedHours;
    private Boolean published;
    private Boolean active;
    private String instructorId;
    private String instructorName;
    private List<String> enrolledUserIds;
    private List<String> assignedLearnerEmails;
    private String assignmentType;
    private List<String> materialIds;

    public static CourseDTO fromEntity(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setThumbnailUrl(course.getThumbnailUrl());
        dto.setDifficultyLevel(course.getDifficultyLevel());
        dto.setEstimatedHours(course.getEstimatedHours());
        dto.setPublished(course.getPublished());
        dto.setActive(course.getActive());
        dto.setInstructorId(course.getInstructorId());
        dto.setEnrolledUserIds(course.getEnrolledUserIds());
        dto.setAssignedLearnerEmails(course.getAssignedLearnerEmails());
        dto.setAssignmentType(course.getAssignmentType());
        dto.setMaterialIds(course.getMaterialIds());
        return dto;
    }
}
