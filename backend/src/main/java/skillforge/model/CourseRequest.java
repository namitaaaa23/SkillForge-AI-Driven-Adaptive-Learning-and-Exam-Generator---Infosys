package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "course_requests")
public class CourseRequest {
    @Id
    private String id;
    private String learnerId;
    private String learnerEmail;
    private String learnerName;
    private String courseName;
    private String courseDescription;
    private String reason;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private String adminResponse;
}
