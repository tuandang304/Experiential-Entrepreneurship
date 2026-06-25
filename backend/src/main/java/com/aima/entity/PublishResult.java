package com.aima.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Result returned by the platform for each publish attempt of a {@link Post}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "publish_results")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PublishResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Post post;

    @Column(name = "is_success", nullable = false)
    Boolean isSuccess;

    @Column(name = "response_code", length = 50)
    String responseCode;

    @Column(name = "response_message", columnDefinition = "text")
    String responseMessage;
}
