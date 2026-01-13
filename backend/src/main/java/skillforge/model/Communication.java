package com.skillforge.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "communications")
public class Communication {
    @Id
    private String id;
    private String guardianId;
    private String adminId;
    private String studentId;
    private String subject;
    private List<Message> messages;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private boolean isActive;
    private String status;

    public static class Message {
        public String senderId;
        public String senderRole;
        public String content;
        public LocalDateTime sentAt;
        public boolean isRead;

        public Message() {}
        public Message(String senderId, String senderRole, String content) {
            this.senderId = senderId;
            this.senderRole = senderRole;
            this.content = content;
            this.sentAt = LocalDateTime.now();
            this.isRead = false;
        }
    }

    public Communication() {
        this.createdAt = LocalDateTime.now();
        this.messages = new ArrayList<>();
        this.isActive = true;
        this.status = "OPEN";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGuardianId() { return guardianId; }
    public void setGuardianId(String guardianId) { this.guardianId = guardianId; }

    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
