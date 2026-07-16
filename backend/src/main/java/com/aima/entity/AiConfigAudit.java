package com.aima.entity;

import com.aima.enums.AiConfigAction;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

/**
 * Audit log mọi thay đổi cấu hình AI (provider/model/routing) — ghi ở service trên từng mutation.
 * Append-only, không sửa/xóa.
 */
@Entity
@Table(name = "ai_config_audit", indexes = {
        @Index(name = "idx_ai_config_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_ai_config_audit_created_at", columnList = "created_at")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiConfigAudit extends BaseEntity {

    /** Admin thực hiện thao tác. null = thao tác hệ thống (seed/backfill). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 30)
    AiConfigAction action;

    /** Tên entity bị tác động: AiProvider / AiModel / AiTaskRouting. */
    @Column(name = "entity_type", nullable = false, length = 40)
    String entityType;

    @Column(name = "entity_id", nullable = false)
    UUID entityId;

    /**
     * Snapshot JSON trước thay đổi. RÀNG BUỘC: api_key trong snapshot LUÔN ở dạng masked
     * (vd "sk-ant-••••1234") — không bao giờ lưu plaintext vào audit.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_snapshot", columnDefinition = "jsonb")
    String beforeSnapshot;

    /** Snapshot JSON sau thay đổi — cùng ràng buộc masked key như {@link #beforeSnapshot}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_snapshot", columnDefinition = "jsonb")
    String afterSnapshot;
}
