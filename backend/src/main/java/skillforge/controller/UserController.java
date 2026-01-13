package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.model.User;
import com.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillforge.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody User userUpdates) {
        User updatedUser = userService.updateUser(id, userUpdates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody RegisterRequest request) {
        User createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", createdUser));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", userService.getAllUsers()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable String role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved by role", users));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        User updatedUser = userService.updateUserRole(id, newRole);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updatedUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        user.setActive(true);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("User activated successfully", updatedUser));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable String id) {
        User user = userService.getUserById(id);
        user.setActive(false);
        User updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", updatedUser));
    }
}
