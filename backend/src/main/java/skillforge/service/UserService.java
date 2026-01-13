package com.skillforge.service;

import com.skillforge.dto.AuthRequest;
import com.skillforge.dto.AuthResponse;
import com.skillforge.dto.RegisterRequest;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.model.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User.Role role = User.Role.STUDENT;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role, stick to default
            }
        }
        User user = createNewUser(request, role);

        auditService.logAction(user.getUsername(), "REGISTER", "User registered with role: " + user.getRole(),
                "UNKNOWN");

        String token = jwtUtil.generateToken(user.getEmail());
        return AuthResponse.fromUser(user, token);
    }

    @Transactional
    public User createUser(RegisterRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new com.skillforge.exception.UnauthorizedException("Only Admins can create users manually");
        }

        User.Role role = User.Role.STUDENT;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                role = User.Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid role, stick to default
            }
        }

        User user = createNewUser(request, role);

        auditService.logAction(currentUser.getUsername(), "CREATE_USER",
                "Created user " + user.getUsername() + " with role: " + user.getRole(), "UNKNOWN");

        return user;
    }

    private User createNewUser(RegisterRequest request, User.Role role) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        String finalUsername = request.getUsername();
        if (finalUsername == null || finalUsername.trim().isEmpty()) {
            finalUsername = request.getEmail().split("@")[0];
            String baseUsername = finalUsername;
            int counter = 1;
            while (userRepository.existsByUsername(finalUsername)) {
                finalUsername = baseUsername + counter++;
            }
        } else if (userRepository.existsByUsername(finalUsername)) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(finalUsername);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(role);
        user.setActive(true);

        // Set learner-specific fields if provided
        if (request.getStudentId() != null && !request.getStudentId().trim().isEmpty()) {
            user.setStudentId(request.getStudentId());
        }
        if (request.getInstitution() != null && !request.getInstitution().trim().isEmpty()) {
            user.setInstitution(request.getInstitution());
        }

        return userRepository.save(user);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Emergency Fix: Ensure main admin is always ADMIN
        if ("admin@skillforge.com".equalsIgnoreCase(user.getEmail()) && user.getRole() != User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
            user = userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());
        auditService.logAction(user.getUsername(), "LOGIN", "User logged in", "UNKNOWN");
        return AuthResponse.fromUser(user, token);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public User updateUser(String id, User userUpdates) {
        User user = getUserById(id);

        if (userUpdates.getFullName() != null && !userUpdates.getFullName().trim().isEmpty()) {
            user.setFullName(userUpdates.getFullName());
        }
        if (userUpdates.getBio() != null) {
            user.setBio(userUpdates.getBio());
        }
        if (userUpdates.getProfileImage() != null) {
            user.setProfileImage(userUpdates.getProfileImage());
        }

        User updatedUser = userRepository.save(user);
        auditService.logAction(user.getUsername(), "UPDATE_PROFILE", "User updated profile", "UNKNOWN");

        return updatedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(String id) {
        User user = getUserById(id);
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new com.skillforge.exception.UnauthorizedException("Only admins can delete users");
        }
        userRepository.delete(user);
        auditService.logAction(currentUser.getUsername(), "DELETE_USER", "Deleted user: " + user.getUsername(),
                "UNKNOWN");
    }

    public List<User> getUsersByRole(String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole);
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
    }

    @Transactional
    public User updateUserRole(String id, String newRole) {
        User user = getUserById(id);
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new com.skillforge.exception.UnauthorizedException("Only admins can change user roles");
        }
        try {
            user.setRole(User.Role.valueOf(newRole.toUpperCase()));
            User updated = userRepository.save(user);
            auditService.logAction(currentUser.getUsername(), "UPDATE_ROLE",
                    "Changed role for user: " + user.getUsername() + " to " + newRole, "UNKNOWN");
            return updated;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }
    }

    @Transactional
    public void linkAdminToLearner(String adminId, String learnerId) {
        User admin = getUserById(adminId);
        User learner = getUserById(learnerId);

        if (admin.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("User " + adminId + " is not an ADMIN");
        }
        if (learner.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User " + learnerId + " is not a STUDENT");
        }

        if (admin.getAssignedLearnerIds() == null)
            admin.setAssignedLearnerIds(new java.util.ArrayList<>());
        if (!admin.getAssignedLearnerIds().contains(learnerId)) {
            admin.getAssignedLearnerIds().add(learnerId);
        }
        learner.setAssignedAdminId(adminId);

        userRepository.save(admin);
        userRepository.save(learner);

        auditService.logAction(getCurrentUser().getUsername(), "LINK_USER",
                "Linked Admin " + admin.getUsername() + " to Learner " + learner.getUsername(), "UNKNOWN");
    }

    @Transactional
    public void linkGuardianToWard(String guardianId, String wardId) {
        User guardian = getUserById(guardianId);
        User ward = getUserById(wardId);

        if (guardian.getRole() != User.Role.GUARDIAN) {
            throw new IllegalArgumentException("User " + guardianId + " is not a GUARDIAN");
        }
        if (ward.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User " + wardId + " is not a STUDENT");
        }

        if (guardian.getWardIds() == null)
            guardian.setWardIds(new java.util.ArrayList<>());
        if (!guardian.getWardIds().contains(wardId)) {
            guardian.getWardIds().add(wardId);
        }
        ward.setGuardianId(guardianId);

        userRepository.save(guardian);
        userRepository.save(ward);

        auditService.logAction(getCurrentUser().getUsername(), "LINK_USER",
                "Linked Guardian " + guardian.getUsername() + " to Ward " + ward.getUsername(), "UNKNOWN");
    }

    @Transactional
    public void linkGuardianToWardByEmail(String guardianId, String studentEmail) {
        User guardian = getUserById(guardianId);
        User ward = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + studentEmail));

        if (guardian.getRole() != User.Role.GUARDIAN) {
            throw new IllegalArgumentException("User " + guardianId + " is not a GUARDIAN");
        }
        if (ward.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("User with email " + studentEmail + " is not a STUDENT");
        }

        if (guardian.getWardIds() == null)
            guardian.setWardIds(new java.util.ArrayList<>());
        if (!guardian.getWardIds().contains(ward.getId())) {
            guardian.getWardIds().add(ward.getId());
        }
        ward.setGuardianId(guardianId);

        userRepository.save(guardian);
        userRepository.save(ward);

        auditService.logAction(getCurrentUser().getUsername(), "LINK_USER",
                "Linked Guardian " + guardian.getUsername() + " to Ward " + ward.getUsername() + " (via email)",
                "UNKNOWN");
    }

    @Transactional
    public void unlinkAdminFromLearner(String adminId, String learnerId) {
        User admin = getUserById(adminId);
        User learner = getUserById(learnerId);

        if (admin.getAssignedLearnerIds() != null) {
            admin.getAssignedLearnerIds().remove(learnerId);
        }
        if (adminId.equals(learner.getAssignedAdminId())) {
            learner.setAssignedAdminId(null);
        }

        userRepository.save(admin);
        userRepository.save(learner);
    }

    @Transactional
    public void unlinkGuardianFromWard(String guardianId, String wardId) {
        User guardian = getUserById(guardianId);
        User ward = getUserById(wardId);

        if (guardian.getWardIds() != null) {
            guardian.getWardIds().remove(wardId);
        }
        if (guardianId.equals(ward.getGuardianId())) {
            ward.setGuardianId(null);
        }

        userRepository.save(guardian);
        userRepository.save(ward);
    }

    public List<User> getWardsForGuardian(String guardianId) {
        User guardian = getUserById(guardianId);
        List<String> wardIds = guardian.getWardIds();
        if (wardIds == null || wardIds.isEmpty())
            return new java.util.ArrayList<>();
        return userRepository.findAllById(wardIds);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
