package com.aima.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

/**
 * AI insight derived from {@link PostAnalytics} (BR-10: past analytics optimize
 * future strategy).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "optimization_insights")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OptimizationInsight extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "analytics_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    PostAnalytics analytics;

    @Column(name = "insight_content", nullable = false, columnDefinition = "text")
    String insightContent;

    @Column(name = "recommendation", columnDefinition = "text")
    String recommendation;

    // Cha sở hữu của StrategyAdjustment cho purge (ContentStrategy không cascade — 8.18).
    @OneToMany(mappedBy = "insight", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<StrategyAdjustment> strategyAdjustments = new ArrayList<>();
}
