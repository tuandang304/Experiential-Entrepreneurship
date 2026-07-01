package com.aima.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cấu hình gọi AI service (Python/FastAPI). Map từ block {@code ai-service.*} trong application.yml.
 */
@ConfigurationProperties(prefix = "ai-service")
public record AiServiceProperties(
        String baseUrl,
        long timeoutSeconds
) {
}
