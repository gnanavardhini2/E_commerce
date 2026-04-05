package com.example.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        String rawPassword = "admin123";
        String hashed = new BCryptPasswordEncoder().encode(rawPassword);
        System.out.println("BCrypt hash for 'admin123': " + hashed);
    }
}
