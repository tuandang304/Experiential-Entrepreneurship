package com.aima.entity;

import com.aima.enums.Platform;
import com.aima.enums.StrategyStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Content strategy attached to a brand profile (BR-02: one brand → many
 * strategies).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "content_strategies")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContentStrategy extends BaseEntity {

    // Đơn vị tần suất đăng mặc định — dùng chung cho entity/mapper/service, tránh lặp magic string.
    public static final String DEFAULT_FREQUENCY_UNIT = "WEEK";

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_profile_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    BrandProfile brandProfile;

    @Column(name = "name", nullable = false, length = 150)
    String name;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "content_strategy_goals", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "goal", length = 150)
    List<String> goals = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "content_strategy_content_types", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "content_type", length = 150)
    List<String> contentTypes = new ArrayList<>();

    @Column(name = "posts_per_week", nullable = false)
    Integer frequencyCount;

    @Column(name = "frequency_unit", length = 10)
    String frequencyUnit = DEFAULT_FREQUENCY_UNIT;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "content_strategy_platforms", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "platform", length = 20)
    Set<Platform> platforms = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "content_strategy_time_slots", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "time_slot", length = 30)
    List<String> preferredTimes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "content_strategy_target_audience", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "audience", length = 150)
    List<String> targetAudience = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "content_strategy_styles", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "style", length = 150)
    List<String> contentStyle = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "content_strategy_cta_types", joinColumns = @JoinColumn(name = "content_strategy_id"))
    @Column(name = "cta_type", length = 150)
    List<String> ctaTypes = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    StrategyStatus status = StrategyStatus.DRAFT;

    // Cha phụ của StrategyAdjustment: KHÔNG cascade (8.18: "Xóa ContentStrategy →
    // không cascade").
    @OneToMany(mappedBy = "strategy")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<StrategyAdjustment> strategyAdjustments = new ArrayList<>();

    // Purge: job async tham chiếu strategy — cascade để xóa cứng không vi phạm khóa ngoại.
    @OneToMany(mappedBy = "contentStrategy", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<ContentGenerationJob> generationJobs = new ArrayList<>();

    @OneToMany(mappedBy = "contentStrategy", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<StrategyOptimizationJob> optimizationJobs = new ArrayList<>();
}
