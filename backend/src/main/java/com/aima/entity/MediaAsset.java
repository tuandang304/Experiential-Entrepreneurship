package com.aima.entity;

import com.aima.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Media or media-prompt belonging to a {@link ContentItem}. In the MVP the AI
 * only produces PROMPT-type assets (FR-29); images/videos are user-supplied.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "media_assets")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MediaAsset extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_item_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    ContentItem contentItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    MediaType mediaType;

    @Column(name = "media_url", length = 500)
    String mediaUrl;

    @Column(name = "media_prompt", columnDefinition = "text")
    String mediaPrompt;

    @Column(name = "format", length = 20)
    String format;

    @Column(name = "size")
    Long size;

    @Column(name = "duration")
    Integer duration;
}
