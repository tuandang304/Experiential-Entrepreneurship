package com.aima.entity;

import com.aima.enums.Platform;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * A trend discovered within a {@link TrendResearchSession}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "trends")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Trend extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "research_session_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    TrendResearchSession researchSession;

    @Column(name = "trend_name", nullable = false, length = 255)
    String trendName;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 20)
    Platform platform;

    @Column(name = "relevance_score", precision = 5, scale = 2)
    BigDecimal relevanceScore;

    @Column(name = "description", columnDefinition = "text")
    String description;

    // Cùng lý do SQLRestriction ở TrendResearchSession.trends: idea của trend đã xóa
    // (soft delete cascade) không xuất hiện trong response/counts.
    @OneToMany(mappedBy = "trend", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.SQLRestriction("deleted_at is null")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<ContentIdea> contentIdeas = new ArrayList<>();
}
