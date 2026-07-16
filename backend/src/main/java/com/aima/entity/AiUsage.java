package com.aima.entity;

import com.aima.enums.AiProviderCode;
import com.aima.enums.AiTaskCode;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Bản ghi token usage chi tiết theo từng lần gọi AI (task/provider/model) — nguồn cho trang
 * admin "Sử dụng & chi phí". Bổ sung cho {@code users.tokens_used} (tổng theo tháng,
 * TokenUsageService) chứ không thay thế. Append-only.
 */
@Entity
@Table(name = "ai_usage", indexes = {
        @Index(name = "idx_ai_usage_user", columnList = "user_id"),
        @Index(name = "idx_ai_usage_task_code", columnList = "task_code"),
        @Index(name = "idx_ai_usage_created_at", columnList = "created_at")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiUsage extends BaseEntity {

    /** User sở hữu request. null = job hệ thống không gắn user. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_code", nullable = false, length = 40)
    AiTaskCode taskCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_code", nullable = false, length = 30)
    AiProviderCode providerCode;

    @Column(name = "model_code", nullable = false, length = 100)
    String modelCode;

    /** AI service hiện chỉ trả tổng token — input/output để null tới khi tách được. */
    @Column(name = "input_tokens")
    Long inputTokens;

    @Column(name = "output_tokens")
    Long outputTokens;

    @Column(name = "total_tokens", nullable = false)
    Long totalTokens;

    /** Chi phí ƯỚC TÍNH (USD) theo đơn giá trên ai_models tại thời điểm ghi. */
    @Column(name = "estimated_cost", precision = 14, scale = 6)
    BigDecimal estimatedCost;
}
