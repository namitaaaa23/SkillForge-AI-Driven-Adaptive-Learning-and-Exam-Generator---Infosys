package com.skillforge.service;

import com.skillforge.model.AuditLog;
import com.skillforge.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String username, String action, String details, String ipAddress) {
        try {
            AuditLog log = new AuditLog();
            log.setUsername(username);
            log.setAction(action);
            log.setDetails(details);
            log.setIpAddress(ipAddress);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Silently fail to prevent auth failures due to audit logging
        }
    }
}
