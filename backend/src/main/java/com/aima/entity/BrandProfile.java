package com.aima.entity;

import com.aima.enums.Platform;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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

    @Column(columnDefinition = "text", length = 500)
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

    // Nhận diện thương hiệu (do UI gửi lên). LAZY để tránh MultipleBagFetchException
    // khi entity có nhiều List @ElementCollection — service đang @Transactional nên
    // mapper vẫn đọc được trước khi đóng transaction.
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "brand_profile_keywords", joinColumns = @JoinColumn(name = "brand_profile_id"))
    @Column(name = "keyword", length = 100)
    List<String> brandKeywords = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "brand_profile_dos", joinColumns = @JoinColumn(name = "brand_profile_id"))
    @Column(name = "do_item", length = 150)
    List<String> brandDos = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "brand_profile_donts", joinColumns = @JoinColumn(name = "brand_profile_id"))
    @Column(name = "dont_item", length = 150)
    List<String> brandDonts = new ArrayList<>();

    @Column(name = "logo_url", length = 500)
    String logoUrl;

    // Cờ "Hồ sơ đang dùng" — tối đa 1 active / user (xử lý ở service layer).
    @Column(name = "is_active", nullable = false)
    Boolean isActive = false;

    // Độ hoàn thiện 0–100; có thể tính động thay vì lưu cứng.
    @Column(name = "brand_health_score")
    Integer brandHealthScore;

    @OneToMany(mappedBy = "brandProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ContentStrategy> contentStrategies = new ArrayList<>();

    @OneToMany(mappedBy = "brandProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TrendResearchSession> trendResearchSessions = new ArrayList<>();

    @OneToMany(mappedBy = "brandProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    List<ContentItem> contentItems = new ArrayList<>();
}
