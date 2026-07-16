package com.aima.entity;

import com.aima.enums.AiProviderCode;
import com.aima.enums.AiTestStatus;
import com.aima.util.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Nhà cung cấp LLM (Anthropic/Google) do admin quản lý — nguồn API key cho AI service
 * khi bật {@code ai-config.from-db}. Unique theo code qua partial index
 * {@code uk_ai_providers_code} (WHERE deleted_at IS NULL, tạo ở AiConfigDataInitializer).
 */
@Entity
@Table(name = "ai_providers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiProvider extends BaseEntity {

    /** Mã nhà cung cấp — khớp {@code llm_provider} phía ai/src/config.py; không đổi sau khi tạo. */
    @Enumerated(EnumType.STRING)
    @Column(name = "code", nullable = false, length = 30, updatable = false)
    AiProviderCode code;

    @Column(name = "name", nullable = false, length = 100)
    String name;

    /**
     * API key — mã hoá AES-256-GCM khi ghi DB ({@link EncryptedStringConverter}, khoá
     * {@code AIMA_ENCRYPTION_KEY}, SEC-03). null = chưa cấu hình. Không bao giờ trả full key
     * về client (chỉ masked) và không bao giờ log.
     */
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "api_key", columnDefinition = "text")
    String apiKey;

    /** Tắt = mọi routing dùng provider này không hoạt động (runtime rơi về cấu hình env). */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    Boolean enabled = false;

    @Column(name = "last_tested_at")
    LocalDateTime lastTestedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_test_status", length = 20)
    AiTestStatus lastTestStatus;
}
