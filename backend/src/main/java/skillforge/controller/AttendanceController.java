package com.skillforge.controller;

import com.skillforge.dto.ApiResponse;
import com.skillforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final UserService userService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAttendanceRecords(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved", List.of()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAttendance(@RequestBody Map<String, Object> attendanceData) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked", attendanceData));
    }

    @PostMapping("/leave-request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestLeave(@RequestBody Map<String, Object> leaveData) {
        return ResponseEntity.ok(ApiResponse.success("Leave request submitted", leaveData));
    }
}
