package com.aima.entity;

import com.aima.enums.Platform;
import com.aima.enums.PostingFrequency;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "brand_profiles")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandProfile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "brand_name", nullable = false, length = 150)
    String brandName;

    @Column(nullable = false, length = 100)
    String industry;

    @Column(columnDefinition = "text")
    String description;

    @Column(name = "brand_voice", length = 255)
    String brandVoice;

    @Column(name = "target_audience", nullable = false, length = 500)
    String targetAudience;

    @Column(name = "content_goal", columnDefinition = "text")
    String contentGoal;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "brand_profile_platforms", joinColumns = @JoinColumn(name = "brand_profile_id"))
    @Column(name = "platform", length = 20)
    Set<Platform> platforms = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "posting_frequency", nullable = false, length = 20)
    PostingFrequency postingFrequency;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "brand_profile_time_slots", joinColumns = @JoinColumn(name = "brand_profile_id"))
    @Column(name = "time_slot", length = 30)
    List<String> preferredTimes = new ArrayList<>();
}
