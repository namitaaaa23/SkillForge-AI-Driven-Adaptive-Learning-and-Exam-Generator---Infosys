package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skillforge.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String fullName;
    @JsonProperty("role")
    private String role;
    private String studentId; // For learners
    private String institution; // For learners

    public static AuthResponse fromUser(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole().name());
        response.setStudentId(user.getStudentId());
        response.setInstitution(user.getInstitution());
        return response;
    }
}
