package com.aima.entity;

import com.aima.enums.GenerationJobStatus;
import com.aima.enums.RegenField;
import com.aima.enums.RegenSection;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Tác vụ AI (NFR-04, async) tạo lại MỘT phần kịch bản của một {@link ContentVersion}: hook/body/cta
 * × content/scene (và tùy chọn một bước cụ thể). Worker patch NGAY nhánh tương ứng trong JSON script
 * của version (in-place, không tạo version mới) và lưu fragment kết quả vào {@code resultPatch} để FE
 * poll về merge đúng phần đó — không đụng các phần khác (giữ chỉnh sửa tay của người dùng).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "content_regeneration_jobs")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContentRegenerationJob extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_version_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    ContentVersion contentVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "section", nullable = false, length = 10)
    RegenSection section;

    @Enumerated(EnumType.STRING)
    @Column(name = "field", nullable = false, length = 10)
    RegenField field;

    /** Chỉ có nghĩa khi section=BODY: tạo lại một bước cụ thể; null = tất cả các bước. */
    @Column(name = "step_index")
    Integer stepIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    GenerationJobStatus status = GenerationJobStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "text")
    String errorMessage;

    /** IP/User-Agent client lúc user tạo job (X-Forwarded-For aware qua util RequestMeta) —
     *  null với job do hệ thống/scheduler tạo. Nguồn copy sang event usage (điều tra bất thường). */
    @Column(name = "client_ip", length = 45)
    String clientIp;

    @Column(name = "user_agent", length = 300)
    String userAgent;

    /** Fragment JSON đã tạo lại (chỉ phần thay đổi) — FE poll về merge; null cho tới khi SUCCESS. */
    @Column(name = "result_patch", columnDefinition = "text")
    String resultPatch;
}
