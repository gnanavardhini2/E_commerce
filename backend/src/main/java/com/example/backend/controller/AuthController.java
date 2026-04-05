
package com.example.backend.controller;
import java.util.Map;
import java.util.Optional;

import com.example.backend.dto.*;
import com.example.backend.model.User;
import com.example.backend.service.JwtService;
import com.example.backend.service.UserService;
import com.example.backend.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtService jwtService;
    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;



    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @jakarta.validation.Valid RegisterRequest request) {
        try {
            User user = userService.register(request);
            // Send registration email
            emailService.sendEmail(user.getEmail(), "Welcome to VardhiniChaiCart!", "Thank you for registering, " + user.getName() + "!");
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setName(user.getName());
            userDto.setEmail(user.getEmail());
            userDto.setRole(user.getRole().name());
            return ResponseEntity.ok(userDto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("👉 Login attempt for: " + request.getEmail());

            Optional<User> userOpt = userService.authenticateUser(request.getEmail(), request.getPassword());
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                System.out.println("✅ Login success: " + u.getEmail());
                com.example.backend.dto.UserDto dto = new com.example.backend.dto.UserDto();
                dto.setId(u.getId());
                dto.setName(u.getName());
                dto.setEmail(u.getEmail());
                dto.setRole(u.getRole().name());
                // Generate JWT token
                String token = jwtService.generateToken(u);
                return ResponseEntity.ok(java.util.Map.of(
                    "token", token,
                    "user", dto
                ));
            } else {
                System.out.println("❌ Invalid credentials");
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        } catch (Exception e) {
            System.out.println("🔥 LOGIN ERROR:");
            e.printStackTrace(); // VERY IMPORTANT
            return ResponseEntity.status(500).body("Server error");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody @jakarta.validation.Valid ForgotPasswordRequest request,
            HttpServletRequest httpRequest,
            @RequestHeader(value = "Origin", required = false) String origin,
            @RequestHeader(value = "Referer", required = false) String referer
    ) {
        try {
            Optional<String> tokenOpt = userService.createPasswordResetToken(request.getEmail());
            String baseUrl = resolveFrontendBaseUrl(origin, referer, httpRequest);

            tokenOpt.ifPresent(token -> {
                String resetLink = baseUrl + "/reset-password?token=" + token;
                String subject = "Reset your VardhiniChaiCart password";
                String html = """
                        <div style=\"font-family:Arial,sans-serif;line-height:1.6;color:#0f172a\">
                          <h2 style=\"margin:0 0 12px;\">Password Reset Request</h2>
                          <p>We received a request to reset your password.</p>
                          <p>This link will expire in 30 minutes.</p>
                          <p style=\"margin:18px 0;\">
                            <a href=\"%s\" style=\"background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;\">Reset Password</a>
                          </p>
                          <p>If you did not request this, you can safely ignore this email.</p>
                        </div>
                        """.formatted(resetLink);
                emailService.sendHtmlEmail(request.getEmail(), subject, html);
            });

            return ResponseEntity.ok(Map.of("message", "If your email is registered, you will receive a reset link shortly."));
        } catch (Exception e) {
            log.error("Forgot password failed for {}", request.getEmail(), e);
            String message = e.getMessage() == null ? "Failed to process forgot password request" : e.getMessage();
            return ResponseEntity.status(500).body(Map.of("error", message));
        }
    }

    private String resolveFrontendBaseUrl(String origin, String referer, HttpServletRequest httpRequest) {
        if (StringUtils.hasText(origin)) {
            return origin.replaceAll("/$", "");
        }

        if (StringUtils.hasText(referer)) {
            String trimmed = referer.replaceAll("/$", "");
            int idx = trimmed.indexOf("/reset-password");
            if (idx > 0) {
                return trimmed.substring(0, idx);
            }
            int schemeIdx = trimmed.indexOf("://");
            if (schemeIdx > -1) {
                int hostEnd = trimmed.indexOf('/', schemeIdx + 3);
                if (hostEnd > -1) {
                    return trimmed.substring(0, hostEnd);
                }
                return trimmed;
            }
        }

        String forwardedProto = httpRequest.getHeader("X-Forwarded-Proto");
        String forwardedHost = httpRequest.getHeader("X-Forwarded-Host");
        if (StringUtils.hasText(forwardedProto) && StringUtils.hasText(forwardedHost)) {
            return (forwardedProto + "://" + forwardedHost).replaceAll("/$", "");
        }

        return frontendBaseUrl.replaceAll("/$", "");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @jakarta.validation.Valid ResetPasswordRequest request) {
        try {
            userService.resetPasswordByToken(request.getToken(), request.getPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login with your new password."));
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reset password"));
        }
    }
}
