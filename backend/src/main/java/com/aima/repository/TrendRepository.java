package com.aima.repository;

import com.aima.entity.Trend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrendRepository extends JpaRepository<Trend, UUID> {

    /**
     * Trend theo id nhưng CHỈ khi thuộc user (qua phiên research → brand profile) và chưa
     * soft-delete — dùng khi resolve trend gắn vào job tạo nội dung (chống gắn id của người khác).
     */
    Optional<Trend> findByIdAndResearchSession_BrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);

    // Xóa nhiều trend không phù hợp (multi-select) — chỉ trend thuộc user, chưa soft-delete.
    List<Trend> findByIdInAndResearchSession_BrandProfile_User_IdAndDeletedAtIsNull(Collection<UUID> ids, UUID userId);
}
