package com.skillforge.config;

import com.skillforge.model.User;
import com.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@skillforge.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@skillforge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Default admin user created: admin@skillforge.com / admin123");
        }

        if (userRepository.findByEmail("instructor@skillforge.com").isEmpty()) {
            User instructor = new User();
            instructor.setUsername("instructor");
            instructor.setEmail("instructor@skillforge.com");
            instructor.setPassword(passwordEncoder.encode("instructor123"));
            instructor.setFullName("Sample Instructor");
            instructor.setRole(User.Role.ADMIN);
            instructor.setActive(true);
            userRepository.save(instructor);
            log.info("Default instructor user created: instructor@skillforge.com / instructor123");
        }

        if (userRepository.findByEmail("student@skillforge.com").isEmpty()) {
            User student = new User();
            student.setUsername("student");
            student.setEmail("student@skillforge.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setFullName("Sample Student");
            student.setRole(User.Role.STUDENT);
            student.setActive(true);
            userRepository.save(student);
            log.info("Default student user created: student@skillforge.com / student123");
        }
    }
}

