package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User register (RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
            .enabled(true)
                .build();
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<String> createPasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);
        return Optional.of(token);
    }

    public void resetPasswordByToken(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    /**
     * Authenticate user by email and password using BCrypt.
     * Full debug logging for troubleshooting.
     * Returns Optional<User> if credentials are valid, else Optional.empty().
     */
    public Optional<User> authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("❌ User not found: " + email);
            return Optional.empty();
        }
        User user = userOpt.get();
        if (Boolean.FALSE.equals(user.getEnabled())) {
            System.out.println("❌ User disabled: " + email);
            return Optional.empty();
        }
        System.out.println("👉 Entered Password: " + password);
        System.out.println("👉 Stored Hash: " + user.getPassword());
        boolean match = passwordEncoder.matches(password, user.getPassword());
        System.out.println("✅ Password Match Result: " + match);
        if (match) {
            return Optional.of(user);
        } else {
            return Optional.empty();
        }
    }

    public List<AdminUserDto> getAllUsersForAdmin() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserDto)
                .collect(Collectors.toList());
    }

    public AdminUserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        boolean currentlyEnabled = Boolean.TRUE.equals(user.getEnabled());
        user.setEnabled(!currentlyEnabled);
        return toAdminUserDto(userRepository.save(user));
    }

    public AdminUserDto changeUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalized = role == null ? "" : role.trim().toUpperCase();
        User.Role parsedRole;
        try {
            parsedRole = User.Role.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }

        user.setRole(parsedRole);
        return toAdminUserDto(userRepository.save(user));
    }

    public AdminUserDto deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        AdminUserDto dto = toAdminUserDto(user);
        userRepository.delete(user);
        return dto;
    }

    private AdminUserDto toAdminUserDto(User user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() == User.Role.ADMIN ? "admin" : "user");
        dto.setStatus(Boolean.FALSE.equals(user.getEnabled()) ? "disabled" : "active");
        return dto;
    }
}
