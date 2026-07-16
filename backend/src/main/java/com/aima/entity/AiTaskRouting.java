package com.aima.entity;

import com.aima.enums.AiTaskCode;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Định tuyến model theo nghiệp vụ: mỗi {@link AiTaskCode} một dòng (partial unique index
 * {@code uk_ai_task_routing_task_code} WHERE deleted_at IS NULL) — model chính, model dự phòng
 * và tham số sinh (temperature/max_tokens). null tham số = dùng mặc định của provider/AI service.
 */
@Entity
@Table(name = "ai_task_routing", indexes = {
        @Index(name = "idx_ai_task_routing_task_code", columnList = "task_code")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiTaskRouting extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "task_code", nullable = false, length = 40, updatable = false)
    AiTaskCode taskCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "primary_model_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    AiModel primaryModel;

    /** Model thử lại 1 lần khi model chính lỗi (xử lý phía AI service trong cùng request). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fallback_model_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    AiModel fallbackModel;

    @Column(name = "temperature")
    Double temperature;

    @Column(name = "max_tokens")
    Integer maxTokens;

    /** Tắt = task này không dùng config DB (runtime rơi về cấu hình env của AI service). */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    Boolean enabled = true;
}
