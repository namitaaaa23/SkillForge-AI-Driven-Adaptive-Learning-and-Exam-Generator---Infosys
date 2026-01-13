package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/linking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LinkingController {

    private final UserService userService;

    @PostMapping("/admin/{adminId}/learner/{learnerId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> linkAdminToLearner(
            @PathVariable String adminId,
            @PathVariable String learnerId) {
        userService.linkAdminToLearner(adminId, learnerId);
        return ResponseEntity.ok(ApiResponse.success("Admin linked to learner", Map.of()));
    }

    @PostMapping("/guardian/{guardianId}/ward/{wardId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> linkGuardianToWard(
            @PathVariable String guardianId,
            @PathVariable String wardId) {
        userService.linkGuardianToWard(guardianId, wardId);
        return ResponseEntity.ok(ApiResponse.success("Guardian linked to ward", Map.of()));
    }

    @DeleteMapping("/admin/{adminId}/learner/{learnerId}")
    public ResponseEntity<ApiResponse<Void>> unlinkAdminFromLearner(
            @PathVariable String adminId,
            @PathVariable String learnerId) {
        userService.unlinkAdminFromLearner(adminId, learnerId);
        return ResponseEntity.ok(ApiResponse.success("Admin unlinked from learner", null));
    }

    @DeleteMapping("/guardian/{guardianId}/ward/{wardId}")
    public ResponseEntity<ApiResponse<Void>> unlinkGuardianFromWard(
            @PathVariable String guardianId,
            @PathVariable String wardId) {
        userService.unlinkGuardianFromWard(guardianId, wardId);
        return ResponseEntity.ok(ApiResponse.success("Guardian unlinked from ward", null));
    }

    @GetMapping("/admin/{adminId}/learners")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAdminLearners(@PathVariable String adminId) {
        // TODO: Implement actual retrieval if needed
        return ResponseEntity.ok(ApiResponse.success("Admin learners retrieved", List.of()));
    }

    @GetMapping("/guardian/{guardianId}/wards")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGuardianWards(@PathVariable String guardianId) {
        // TODO: Implement actual retrieval if needed
        return ResponseEntity.ok(ApiResponse.success("Guardian wards retrieved", List.of()));
    }
}
