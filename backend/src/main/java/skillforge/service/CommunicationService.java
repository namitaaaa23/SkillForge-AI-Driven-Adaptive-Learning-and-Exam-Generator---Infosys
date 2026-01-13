package com.skillforge.service;

import com.skillforge.model.Communication;
import com.skillforge.repository.CommunicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommunicationService {
    @Autowired
    private CommunicationRepository communicationRepository;

    public Communication startConversation(String guardianId, String adminId, String studentId, String subject) {
        Optional<Communication> existing = communicationRepository.findByGuardianIdAndAdminIdAndStudentId(guardianId, adminId, studentId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        Communication communication = new Communication();
        communication.setGuardianId(guardianId);
        communication.setAdminId(adminId);
        communication.setStudentId(studentId);
        communication.setSubject(subject);
        return communicationRepository.save(communication);
    }

    public Communication sendMessage(String communicationId, String senderId, String senderRole, String content) {
        Optional<Communication> comm = communicationRepository.findById(communicationId);
        if (comm.isPresent()) {
            Communication communication = comm.get();
            Communication.Message message = new Communication.Message(senderId, senderRole, content);
            communication.getMessages().add(message);
            communication.setLastMessageAt(LocalDateTime.now());
            return communicationRepository.save(communication);
        }
        return null;
    }

    public List<Communication> getGuardianConversations(String guardianId) {
        return communicationRepository.findByGuardianId(guardianId);
    }

    public List<Communication> getAdminConversations(String adminId) {
        return communicationRepository.findByAdminId(adminId);
    }

    public Optional<Communication> getConversation(String communicationId) {
        return communicationRepository.findById(communicationId);
    }

    public Communication closeConversation(String communicationId) {
        Optional<Communication> comm = communicationRepository.findById(communicationId);
        if (comm.isPresent()) {
            Communication communication = comm.get();
            communication.setActive(false);
            communication.setStatus("CLOSED");
            return communicationRepository.save(communication);
        }
        return null;
    }
}
