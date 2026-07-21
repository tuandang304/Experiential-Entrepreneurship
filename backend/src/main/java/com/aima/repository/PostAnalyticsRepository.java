package com.aima.repository;

import com.aima.entity.PostAnalytics;
import com.aima.repository.projection.DailyEngagementProjection;
import com.aima.repository.projection.DailyMetricProjection;
import com.aima.repository.projection.PlatformMetricProjection;
import com.aima.repository.projection.TopPostProjection;
import com.aima.repository.projection.TopicMetricProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostAnalyticsRepository extends JpaRepository<PostAnalytics, UUID> {

    /*
     * Hai truy vấn dưới đây tổng hợp số liệu cho Bảng điều khiển. Cả hai đều native vì cần
     * DISTINCT ON của PostgreSQL: post_analytics lưu số liệu CỘNG DỒN ở các mốc 24h/48h/168h,
     * nên mỗi bài chỉ được lấy MỘT snapshot (mốc giờ lớn nhất) — cộng cả ba mốc sẽ đếm trùng.
     * Tất cả đều lọc theo user qua posts → post_schedules → platform_accounts.user_id (API-03).
     */

    // Biểu đồ "Hiệu suất nội dung": tiếp cận (views) + tương tác (likes+comments+shares) theo NGÀY ĐĂNG.
    @Query(value = """
            select to_char(p.published_at, 'YYYY-MM-DD') as day,
                   cast(coalesce(sum(la.views), 0) as bigint) as reach,
                   cast(coalesce(sum(coalesce(la.likes, 0) + coalesce(la.comments, 0)
                                     + coalesce(la.shares, 0)), 0) as bigint) as engagement
            from posts p
            join post_schedules ps on ps.id = p.schedule_id and ps.deleted_at is null
            join platform_accounts pa on pa.id = ps.platform_account_id and pa.deleted_at is null
            left join (
                select distinct on (a.post_id) a.post_id, a.views, a.likes, a.comments, a.shares
                from post_analytics a
                where a.deleted_at is null
                order by a.post_id, a.milestone_hours desc nulls last
            ) la on la.post_id = p.id
            where pa.user_id = :userId
              and p.deleted_at is null
              and p.status = 'POSTED'
              and p.published_at is not null
              and p.published_at >= :from
            group by 1
            order by 1
            """, nativeQuery = true)
    List<DailyMetricProjection> findDailyPerformanceForUser(@Param("userId") UUID userId,
                                                            @Param("from") LocalDateTime from);

    // Khối "Top chủ đề hiệu quả": chủ đề = trend gắn với bài (content_items.trend_id — tham chiếu
    // mềm nên join tường minh). LEFT JOIN toàn bộ nhánh đăng bài để chủ đề chưa đăng vẫn xuất hiện
    // với engagement = 0 (xếp hạng kết hợp: tương tác trước, số bài sau).
    @Query(value = """
            select t.trend_name as name,
                   count(distinct i.id) as posts,
                   cast(coalesce(sum(coalesce(la.likes, 0) + coalesce(la.comments, 0)
                                     + coalesce(la.shares, 0)), 0) as bigint) as engagement
            from content_items i
            join brand_profiles bp on bp.id = i.brand_profile_id and bp.deleted_at is null
            join trends t on t.id = i.trend_id and t.deleted_at is null
            left join content_versions cv on cv.content_item_id = i.id and cv.deleted_at is null
            left join post_schedules ps on ps.content_version_id = cv.id and ps.deleted_at is null
            left join posts p on p.schedule_id = ps.id and p.deleted_at is null and p.status = 'POSTED'
            left join (
                select distinct on (a.post_id) a.post_id, a.likes, a.comments, a.shares
                from post_analytics a
                where a.deleted_at is null
                order by a.post_id, a.milestone_hours desc nulls last
            ) la on la.post_id = p.id
            where bp.user_id = :userId and i.deleted_at is null
            group by t.trend_name
            order by engagement desc, posts desc
            limit :limit
            """, nativeQuery = true)
    List<TopicMetricProjection> findTopTopicsForUser(@Param("userId") UUID userId,
                                                     @Param("limit") int limit);

    // Trang Phân tích (UI-08 khối B/C): 4 metric riêng lẻ theo NGÀY ĐĂNG trong [from, to). Cùng khuôn
    // với findDailyPerformanceForUser nhưng KHÔNG gộp thành reach/engagement — FE cần từng metric.
    // platformCsv null = mọi nền tảng; khác null = danh sách tên nền tảng nối bằng dấu phẩy
    // ("FACEBOOK,THREADS"). CAST(:platformCsv AS text) để PostgreSQL suy được kiểu khi bind null.
    @Query(value = """
            select to_char(p.published_at, 'YYYY-MM-DD') as day,
                   cast(coalesce(sum(la.views), 0) as bigint) as views,
                   cast(coalesce(sum(la.likes), 0) as bigint) as likes,
                   cast(coalesce(sum(la.comments), 0) as bigint) as comments,
                   cast(coalesce(sum(la.shares), 0) as bigint) as shares
            from posts p
            join post_schedules ps on ps.id = p.schedule_id and ps.deleted_at is null
            join platform_accounts pa on pa.id = ps.platform_account_id and pa.deleted_at is null
            left join (
                select distinct on (a.post_id) a.post_id, a.views, a.likes, a.comments, a.shares
                from post_analytics a
                where a.deleted_at is null
                order by a.post_id, a.milestone_hours desc nulls last
            ) la on la.post_id = p.id
            where pa.user_id = :userId
              and p.deleted_at is null
              and p.status = 'POSTED'
              and p.published_at is not null
              and p.published_at >= :from
              and p.published_at < :to
              and (cast(:platformCsv as text) is null
                   or p.platform_name = any(string_to_array(cast(:platformCsv as text), ',')))
            group by 1
            order by 1
            """, nativeQuery = true)
    List<DailyEngagementProjection> findDailyEngagementForUser(@Param("userId") UUID userId,
                                                               @Param("from") LocalDateTime from,
                                                               @Param("to") LocalDateTime to,
                                                               @Param("platformCsv") String platformCsv);

    // Khối D — số liệu gộp theo TỪNG nền tảng trong [from, to). Không lọc nền tảng ở đây: donut thể
    // hiện tỷ trọng giữa các nền tảng nên luôn tính tất cả; service tự bổ sung nền tảng chưa có bài.
    @Query(value = """
            select p.platform_name as platform,
                   cast(coalesce(sum(la.views), 0) as bigint) as views,
                   cast(coalesce(sum(la.likes), 0) as bigint) as likes,
                   cast(coalesce(sum(la.comments), 0) as bigint) as comments,
                   cast(coalesce(sum(la.shares), 0) as bigint) as shares,
                   cast(coalesce(sum(coalesce(la.likes, 0) + coalesce(la.comments, 0)
                                     + coalesce(la.shares, 0)), 0) as bigint) as engagement
            from posts p
            join post_schedules ps on ps.id = p.schedule_id and ps.deleted_at is null
            join platform_accounts pa on pa.id = ps.platform_account_id and pa.deleted_at is null
            left join (
                select distinct on (a.post_id) a.post_id, a.views, a.likes, a.comments, a.shares
                from post_analytics a
                where a.deleted_at is null
                order by a.post_id, a.milestone_hours desc nulls last
            ) la on la.post_id = p.id
            where pa.user_id = :userId
              and p.deleted_at is null
              and p.status = 'POSTED'
              and p.published_at is not null
              and p.published_at >= :from
              and p.published_at < :to
            group by p.platform_name
            """, nativeQuery = true)
    List<PlatformMetricProjection> findPlatformMetricsForUser(@Param("userId") UUID userId,
                                                              @Param("from") LocalDateTime from,
                                                              @Param("to") LocalDateTime to);

    // Khối E — bài đã đăng trong [from, to) kèm số liệu mốc muộn nhất; caption/contentItemId lấy từ
    // content_versions (LEFT JOIN để bài không biến mất nếu bản định dạng bị xoá mềm). Sắp xếp theo
    // cột do service quyết định (whitelist) nên ở đây chỉ ORDER BY ngày đăng làm thứ tự nạp mặc định.
    @Query(value = """
            select p.id as postId,
                   cv.content_item_id as contentItemId,
                   p.platform_name as platform,
                   cv.formatted_caption as caption,
                   pa.account_name as accountName,
                   p.published_at as publishedAt,
                   cast(coalesce(la.views, 0) as bigint) as views,
                   cast(coalesce(la.likes, 0) as bigint) as likes,
                   cast(coalesce(la.comments, 0) as bigint) as comments,
                   cast(coalesce(la.shares, 0) as bigint) as shares,
                   cast(coalesce(la.likes, 0) + coalesce(la.comments, 0) + coalesce(la.shares, 0) as bigint) as engagement
            from posts p
            join post_schedules ps on ps.id = p.schedule_id and ps.deleted_at is null
            join platform_accounts pa on pa.id = ps.platform_account_id and pa.deleted_at is null
            left join content_versions cv on cv.id = ps.content_version_id and cv.deleted_at is null
            left join (
                select distinct on (a.post_id) a.post_id, a.views, a.likes, a.comments, a.shares
                from post_analytics a
                where a.deleted_at is null
                order by a.post_id, a.milestone_hours desc nulls last
            ) la on la.post_id = p.id
            where pa.user_id = :userId
              and p.deleted_at is null
              and p.status = 'POSTED'
              and p.published_at is not null
              and p.published_at >= :from
              and p.published_at < :to
              and (cast(:platformCsv as text) is null
                   or p.platform_name = any(string_to_array(cast(:platformCsv as text), ',')))
            order by p.published_at desc
            """, nativeQuery = true)
    List<TopPostProjection> findTopPostsForUser(@Param("userId") UUID userId,
                                                @Param("from") LocalDateTime from,
                                                @Param("to") LocalDateTime to,
                                                @Param("platformCsv") String platformCsv);
}
