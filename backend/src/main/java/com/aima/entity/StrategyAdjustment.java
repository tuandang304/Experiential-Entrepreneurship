package com.aima.entity;

import com.aima.enums.AppliedStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Adjustment to a {@link ContentStrategy} derived from an {@link OptimizationInsight}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "strategy_adjustments")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StrategyAdjustment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "strategy_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    ContentStrategy strategy;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insight_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    OptimizationInsight insight;

    @Column(name = "adjustment_content", nullable = false, columnDefinition = "text")
    String adjustmentContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "applied_status", nullable = false, length = 20)
    AppliedStatus appliedStatus;
}
