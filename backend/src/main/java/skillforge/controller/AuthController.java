package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.dto.AuthRequest;
import com.skillforge.dto.AuthResponse;
import com.skillforge.dto.RegisterRequest;
import com.skillforge.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (com.skillforge.exception.ResourceNotFoundException e) {
            // User not found - return specific message
            log.error("User not found: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("No user found with this email address"));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            // Wrong password
            log.error("Invalid password for: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid password"));
        } catch (Exception e) {
            // Generic error
            log.error("Login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        var user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully",
                AuthResponse.fromUser(user, "")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        log.info("Password reset requested for email: {}", email);

        try {
            // Check if user exists
            if (userService.existsByEmail(email)) {
                // In a real application, you would:
                // 1. Generate a reset token
                // 2. Save it to database with expiration
                // 3. Send email with reset link
                // For now, we'll just return success
                log.info("Password reset link would be sent to: {}", email);
                return ResponseEntity.ok(
                        ApiResponse.success(
                                "If an account exists with this email, a password reset link has been sent.", null));
            } else {
                // Return same message for security (don't reveal if email exists)
                return ResponseEntity.ok(
                        ApiResponse.success(
                                "If an account exists with this email, a password reset link has been sent.", null));
            }
        } catch (Exception e) {
            log.error("Error processing password reset request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while processing your request"));
        }
    }
}
