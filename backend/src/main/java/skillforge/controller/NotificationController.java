package com.skillforge.controller;

import com.skillforge.model.Notification;
import com.skillforge.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestParam String studentId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type) {
        return ResponseEntity.ok(notificationService.createNotification(studentId, title, message, type));
    }

    @PostMapping("/with-action")
    public ResponseEntity<Notification> createNotificationWithAction(
            @RequestParam String studentId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type,
            @RequestParam String actionUrl,
            @RequestParam String priority) {
        return ResponseEntity.ok(notificationService.createNotificationWithAction(studentId, title, message, type, actionUrl, priority));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Notification>> getStudentNotifications(@PathVariable String studentId) {
        return ResponseEntity.ok(notificationService.getStudentNotifications(studentId));
    }

    @GetMapping("/student/{studentId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String studentId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(studentId));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        Notification marked = notificationService.markAsRead(notificationId);
        return marked != null ? ResponseEntity.ok(marked) : ResponseEntity.notFound().build();
    }

    @PostMapping("/student/{studentId}/read-all")
    public ResponseEntity<String> markAllAsRead(@PathVariable String studentId) {
        notificationService.markAllAsRead(studentId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    @GetMapping("/student/{studentId}/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @PathVariable String studentId,
            @PathVariable String type) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(studentId, type));
    }
}
