package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.net.URI;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class CorsConfig {
    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        String frontendOrigin = extractOrigin(frontendBaseUrl);

        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(frontendOrigin, "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001")
                        .allowedOriginPatterns("https://*.onrender.com", "http://192.168.*:*", "http://10.*:*", "http://172.16.*:*", "http://172.17.*:*", "http://172.18.*:*", "http://172.19.*:*", "http://172.2*.*:*", "http://172.30.*:*", "http://172.31.*:*")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:" + uploadDir.toString() + "/");
            }
        };
    }

    private String extractOrigin(String url) {
        try {
            URI uri = URI.create(url);
            if (uri.getScheme() == null || uri.getHost() == null) {
                return "http://localhost:3000";
            }
            if (uri.getPort() == -1) {
                return uri.getScheme() + "://" + uri.getHost();
            }
            return uri.getScheme() + "://" + uri.getHost() + ":" + uri.getPort();
        } catch (Exception ignored) {
            return "http://localhost:3000";
        }
    }
}
