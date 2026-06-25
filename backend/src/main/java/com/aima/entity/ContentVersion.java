package com.aima.entity;

import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Platform-formatted version of a {@link ContentItem} (BR-04: content is
 * formatted specifically per platform).
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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    ContentLifecycle status;

    @OneToOne(mappedBy = "contentVersion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    PostSchedule postSchedule;
}
