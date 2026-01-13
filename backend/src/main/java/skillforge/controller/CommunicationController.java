package com.skillforge.controller;

import com.skillforge.model.Communication;
import com.skillforge.service.CommunicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/communications")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CommunicationController {
    @Autowired
    private CommunicationService communicationService;

    @PostMapping("/start")
    public ResponseEntity<Communication> startConversation(
            @RequestParam String guardianId,
            @RequestParam String adminId,
            @RequestParam String studentId,
            @RequestParam String subject) {
        return ResponseEntity.ok(communicationService.startConversation(guardianId, adminId, studentId, subject));
    }

    @PostMapping("/{communicationId}/message")
    public ResponseEntity<Communication> sendMessage(
            @PathVariable String communicationId,
            @RequestParam String senderId,
            @RequestParam String senderRole,
            @RequestParam String content) {
        Communication updated = communicationService.sendMessage(communicationId, senderId, senderRole, content);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<List<Communication>> getGuardianConversations(@PathVariable String guardianId) {
        return ResponseEntity.ok(communicationService.getGuardianConversations(guardianId));
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Communication>> getAdminConversations(@PathVariable String adminId) {
        return ResponseEntity.ok(communicationService.getAdminConversations(adminId));
    }

    @GetMapping("/{communicationId}")
    public ResponseEntity<Communication> getConversation(@PathVariable String communicationId) {
        return communicationService.getConversation(communicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{communicationId}/close")
    public ResponseEntity<Communication> closeConversation(@PathVariable String communicationId) {
        Communication closed = communicationService.closeConversation(communicationId);
        return closed != null ? ResponseEntity.ok(closed) : ResponseEntity.notFound().build();
    }
}
