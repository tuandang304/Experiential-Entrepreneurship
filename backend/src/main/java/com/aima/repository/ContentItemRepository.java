package com.aima.repository;

import com.aima.entity.ContentItem;
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

    // FR-87: thư viện nội dung — lọc status/platform/thương hiệu/ngành/khoảng ngày + tìm trong caption/script
    // (q rỗng / industry rỗng / param null = bỏ qua điều kiện, cùng mẫu BrandProfileRepository.search).
    // Sắp xếp server-side (phân trang đúng): :sort = 'voice' (điểm brand-voice cao nhất của các bản còn
    // hiệu lực) / 'status' (gom theo trạng thái) / còn lại = mới nhất; mọi kiểu tie-break bằng createdAt desc.
    //
    // Native query: PostgreSQL không suy luận được kiểu của param null trong "? IS NULL" khi dùng JPQL
    // → CAST explicit cho status (varchar), brandProfileId (uuid), platform (varchar), fromDate/toDate (timestamp).
    @Query(value = """
            select i.* from content_items i
            join brand_profiles bp on bp.id = i.brand_profile_id
            where bp.user_id = :userId and i.deleted_at is null
              and (CAST(:status as varchar) is null or i.status = CAST(:status as varchar))
              and (CAST(:brandProfileId as uuid) is null or i.brand_profile_id = CAST(:brandProfileId as uuid))
              and (CAST(:industry as varchar) = '' or bp.industry = CAST(:industry as varchar))
              and (CAST(:platform as varchar) is null or exists (
                    select 1 from content_versions cv
                    where cv.content_item_id = i.id and cv.platform_name = CAST(:platform as varchar) and cv.deleted_at is null))
              and (CAST(:fromDate as timestamp) is null or i.created_at >= CAST(:fromDate as timestamp))
              and (CAST(:toDate as timestamp) is null or i.created_at <= CAST(:toDate as timestamp))
              and (CAST(:q as varchar) = '' or lower(i.caption) like lower(concat('%', CAST(:q as varchar), '%'))
                   or lower(i.script) like lower(concat('%', CAST(:q as varchar), '%')))
            order by
              case when :sort = 'voice' then (
                    select max(v2.voice_score) from content_versions v2
                    where v2.content_item_id = i.id and v2.deleted_at is null) end desc,
              case when :sort = 'status' then i.status end asc,
              i.created_at desc
            """, nativeQuery = true)
    Page<ContentItem> search(@Param("userId") UUID userId,
                             @Param("status") String status,
                             @Param("brandProfileId") UUID brandProfileId,
                             @Param("platform") String platform,
                             @Param("industry") String industry,
                             @Param("fromDate") LocalDateTime fromDate,
                             @Param("toDate") LocalDateTime toDate,
                             @Param("q") String q,
                             @Param("sort") String sort,
                             Pageable pageable);
}
