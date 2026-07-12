package com.aima.entity;

import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

/**
 * Platform-specific version of a {@link ContentItem} (BR-04: content is tailored
 * per platform). Bản GIÀU (B2): mỗi nền tảng mang trọn script/caption/hashtag/CTA/
 * media prompt/brand-voice riêng — sinh trực tiếp từ luồng generate (mỗi nền tảng
 * một job) hoặc từ luồng format (chỉ điền các trường formatted_*).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "content_versions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContentVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_item_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    ContentItem contentItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform_name", nullable = false, length = 20)
    Platform platformName;

    @Column(name = "formatted_caption", columnDefinition = "text")
    String formattedCaption;

    @Column(name = "formatted_hashtag", columnDefinition = "text")
    String formattedHashtag;

    @Column(name = "media_format", length = 20)
    String mediaFormat;

    // ===== Bản giàu theo nền tảng (B2) — luồng generate điền; luồng format để null =====

    /** Kịch bản quay dạng chuỗi JSON có cấu trúc (hook/steps/cta — cùng format ContentItem.script). */
    @Column(name = "script", columnDefinition = "text")
    String script;

    @Column(name = "cta", length = 255)
    String cta;

    @Column(name = "media_prompt", columnDefinition = "text")
    String mediaPrompt;

    /** Mô tả ẢNH TĨNH cho bài (Python trả sẵn — dành cho tính năng tạo ảnh sắp làm). */
    @Column(name = "image_prompt", columnDefinition = "text")
    String imagePrompt;

    // Brand-voice check của AI cho đúng bản nền tảng này (FR-30).
    @Column(name = "voice_aligned")
    Boolean voiceAligned;

    @Column(name = "voice_score")
    Integer voiceScore;

    @Column(name = "voice_notes", columnDefinition = "text")
    String voiceNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    ContentLifecycle status;

    @OneToOne(mappedBy = "contentVersion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    PostSchedule postSchedule;

    // Purge: job tạo-lại tham chiếu version — cascade để xóa cứng không vi phạm khóa ngoại.
    @OneToMany(mappedBy = "contentVersion", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<ContentRegenerationJob> regenerationJobs = new ArrayList<>();
}
