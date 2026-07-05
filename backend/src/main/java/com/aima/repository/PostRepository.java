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
}
