package com.skillforge.service;

import com.skillforge.model.Notification;
import com.skillforge.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(String studentId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setStudentId(studentId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public Notification createNotificationWithAction(String studentId, String title, String message, 
                                                     String type, String actionUrl, String priority) {
        Notification notification = new Notification();
        notification.setStudentId(studentId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setActionUrl(actionUrl);
        notification.setPriority(priority);
        return notificationRepository.save(notification);
    }

    public List<Notification> getStudentNotifications(String studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Notification> getUnreadNotifications(String studentId) {
        return notificationRepository.findByStudentIdAndIsReadFalseOrderByCreatedAtDesc(studentId);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void markAllAsRead(String studentId) {
        List<Notification> unread = getUnreadNotifications(studentId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    public List<Notification> getNotificationsByType(String studentId, String type) {
        return notificationRepository.findByStudentIdAndType(studentId, type);
    }
}
