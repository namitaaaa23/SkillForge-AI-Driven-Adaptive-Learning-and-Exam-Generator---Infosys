package com.skillforge.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
public class AuditLog {
    @Id
    private String id;

    private String action;
    private String username;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp = LocalDateTime.now();
}
