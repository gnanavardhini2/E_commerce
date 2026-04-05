package com.example.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM:${spring.mail.username}}")
    private String fromEmail;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    @Value("${mail.admin.bcc:}")
    private String adminBcc;

    public void sendEmail(String to, String subject, String text) {
        if (StringUtils.hasText(brevoApiKey)) {
            sendViaBrevoApi(to, subject, null, text);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            if (StringUtils.hasText(brevoApiKey)) {
                sendViaBrevoApi(to, subject, htmlContent, null);
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            if (adminBcc != null && !adminBcc.isBlank()) {
                helper.setBcc(adminBcc.trim());
            }

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private void sendViaBrevoApi(String to, String subject, String htmlContent, String textContent) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", Map.of("email", fromEmail));
            payload.put("to", List.of(Map.of("email", to)));
            payload.put("subject", subject);

            if (StringUtils.hasText(htmlContent)) {
                payload.put("htmlContent", htmlContent);
            }
            if (StringUtils.hasText(textContent)) {
                payload.put("textContent", textContent);
            }

            if (StringUtils.hasText(adminBcc)) {
                List<Map<String, String>> bccList = new ArrayList<>();
                bccList.add(Map.of("email", adminBcc.trim()));
                payload.put("bcc", bccList);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_SEND_URL, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Brevo API returned status " + response.getStatusCode().value());
            }
        } catch (Exception e) {
            log.error("Failed to send email via Brevo API to {}", to, e);
            throw new RuntimeException("Failed to send email via Brevo API: " + e.getMessage(), e);
        }
    }
}
