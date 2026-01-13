package com.skillforge.security;

import com.skillforge.model.User;
import com.skillforge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + email));

                // Auto-promote admin@skillforge.com to ADMIN role
                if ("admin@skillforge.com".equalsIgnoreCase(user.getEmail()) && user.getRole() != User.Role.ADMIN) {
                        user.setRole(User.Role.ADMIN);
                        user = userRepository.save(user);
                }

                List<GrantedAuthority> authorities = Collections.singletonList(
                                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

                return org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPassword())
                                .authorities(authorities)
                                .accountExpired(false)
                                .accountLocked(!user.getActive())
                                .credentialsExpired(false)
                                .disabled(!user.getActive())
                                .build();
        }
}
