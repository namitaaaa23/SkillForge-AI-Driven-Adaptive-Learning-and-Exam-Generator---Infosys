package com.skillforge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String fullName;
    private Role role = Role.STUDENT;
    private String profileImage;
    private String bio;
    private String studentId; // For learners
    private String institution; // For learners
    private Boolean active = true;
    private String assignedAdminId;
    private String guardianId;
    private List<String> assignedLearnerIds = new ArrayList<>();
    private List<String> wardIds = new ArrayList<>();
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private List<String> examResultIds = new ArrayList<>();
    private List<String> enrolledCourseIds = new ArrayList<>();

    public enum Role {
        STUDENT, ADMIN, GUARDIAN
    }
}
