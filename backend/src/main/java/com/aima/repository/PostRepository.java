package com.aima.repository;

import com.aima.entity.Post;
import com.aima.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    // FR-59: bài POSTED đã qua mốc :milestone giờ mà CHƯA có bản ghi analytics của mốc đó.
    @Query("select p from Post p where p.status = com.aima.enums.PostStatus.POSTED and p.deletedAt is null "
            + "and p.publishedAt is not null and p.publishedAt <= :threshold "
            + "and not exists (select a from PostAnalytics a where a.post = p "
            + "and a.milestoneHours = :milestone and a.deletedAt is null)")
    List<Post> findDueForAnalytics(@Param("milestone") int milestone, @Param("threshold") LocalDateTime threshold);

    // API-03/SEC-04: bài đăng của user (qua schedule → platform account).
    Page<Post> findByStatusAndSchedule_PlatformAccount_User_IdAndDeletedAtIsNullOrderByPublishedAtDesc(
            PostStatus status, UUID userId, Pageable pageable);

    Optional<Post> findByIdAndSchedule_PlatformAccount_User_IdAndDeletedAtIsNull(UUID id, UUID userId);

    // FR-63..FR-65: bài đã đăng của một brand profile (qua version → item) cho luồng tối ưu chiến lược.
    List<Post> findBySchedule_ContentVersion_ContentItem_BrandProfile_IdAndStatusAndDeletedAtIsNullOrderByPublishedAtDesc(
            UUID brandProfileId, PostStatus status);

    boolean existsBySchedule_ContentVersion_ContentItem_BrandProfile_IdAndStatusAndDeletedAtIsNullAndPostAnalyticsIsNotEmpty(
            UUID brandProfileId, PostStatus status);

    // FR-82/FR-83: admin xem bài thất bại; violationOnly = true → chỉ bài bị từ chối do vi phạm chính sách.
    @Query("select p from Post p where p.status = com.aima.enums.PostStatus.FAILED and p.deletedAt is null "
            + "and (:violationOnly = false or exists (select j from PostingJob j where j.post = p "
            + "and j.errorType = com.aima.enums.PublishErrorType.POLICY_VIOLATION)) "
            + "order by p.updatedAt desc")
    Page<Post> findFailedForAdmin(@Param("violationOnly") boolean violationOnly, Pageable pageable);

    // FR-35..FR-39: bài lỗi CHƯA xử lý của CHÍNH user (trang "Bài lỗi & cần xử lý"), lọc phân loại
    // mode = ALL | POLICY (vi phạm chính sách) | TECHNICAL (lỗi kỹ thuật — không phải vi phạm).
    // Chỉ tính lịch còn FAILED: hủy/đặt lại/đăng lại sẽ đổi schedule khỏi FAILED → tự rời danh sách.
    @Query("select p from Post p where p.status = com.aima.enums.PostStatus.FAILED and p.deletedAt is null "
            + "and p.schedule.status = com.aima.enums.ScheduleStatus.FAILED "
            + "and p.schedule.platformAccount.user.id = :userId "
            + "and (:mode = 'ALL' "
            + "  or (:mode = 'POLICY' and exists (select j from PostingJob j where j.post = p "
            + "      and j.errorType = com.aima.enums.PublishErrorType.POLICY_VIOLATION)) "
            + "  or (:mode = 'TECHNICAL' and not exists (select j from PostingJob j where j.post = p "
            + "      and j.errorType = com.aima.enums.PublishErrorType.POLICY_VIOLATION))) "
            + "order by p.updatedAt desc")
    Page<Post> findFailedForUser(@Param("userId") UUID userId, @Param("mode") String mode, Pageable pageable);

    // Khối "Tổng quan lỗi": tổng bài lỗi + số bài vi phạm chính sách (kỹ thuật = tổng - policy).
    @Query("select count(p) from Post p where p.status = com.aima.enums.PostStatus.FAILED and p.deletedAt is null "
            + "and p.schedule.status = com.aima.enums.ScheduleStatus.FAILED "
            + "and p.schedule.platformAccount.user.id = :userId")
    long countFailedForUser(@Param("userId") UUID userId);

    @Query("select count(p) from Post p where p.status = com.aima.enums.PostStatus.FAILED and p.deletedAt is null "
            + "and p.schedule.status = com.aima.enums.ScheduleStatus.FAILED "
            + "and p.schedule.platformAccount.user.id = :userId "
            + "and exists (select j from PostingJob j where j.post = p "
            + "and j.errorType = com.aima.enums.PublishErrorType.POLICY_VIOLATION)")
    long countPolicyFailedForUser(@Param("userId") UUID userId);

    long countByStatusAndPublishedAtAfterAndDeletedAtIsNull(PostStatus status, LocalDateTime after);

    long countByStatusAndUpdatedAtAfterAndDeletedAtIsNull(PostStatus status, LocalDateTime after);

    // Webhook vi phạm sau khi đăng: tra bài theo id trên nền tảng.
    Optional<Post> findByPlatformPostIdAndDeletedAtIsNull(String platformPostId);
}
