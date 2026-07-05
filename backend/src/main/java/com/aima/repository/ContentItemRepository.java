package com.aima.repository;

import com.aima.entity.ContentItem;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentItemRepository extends JpaRepository<ContentItem, UUID> {

    // API-03/SEC-04: user chỉ thao tác trên nội dung thuộc brand profile của mình.
    Optional<ContentItem> findByIdAndBrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);

    // FR-87: thư viện nội dung — lọc status/platform/ngành/khoảng ngày + tìm trong caption/script
    // (q rỗng / industry rỗng / param null = bỏ qua điều kiện, cùng mẫu BrandProfileRepository.search).
    @Query("""
            select i from ContentItem i
            where i.brandProfile.user.id = :userId and i.deletedAt is null
              and (:status is null or i.status = :status)
              and (:industry = '' or i.brandProfile.industry = :industry)
              and (:platform is null or exists (
                    select v from ContentVersion v
                    where v.contentItem = i and v.platformName = :platform and v.deletedAt is null))
              and (:fromDate is null or i.createdAt >= :fromDate)
              and (:toDate is null or i.createdAt <= :toDate)
              and (:q = '' or lower(i.caption) like lower(concat('%', :q, '%'))
                   or lower(i.script) like lower(concat('%', :q, '%')))
            """)
    Page<ContentItem> search(@Param("userId") UUID userId,
                             @Param("status") ContentLifecycle status,
                             @Param("platform") Platform platform,
                             @Param("industry") String industry,
                             @Param("fromDate") LocalDateTime fromDate,
                             @Param("toDate") LocalDateTime toDate,
                             @Param("q") String q,
                             Pageable pageable);
}
