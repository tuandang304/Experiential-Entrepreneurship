package com.aima.repository;

import com.aima.entity.ContentRegenerationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentRegenerationJobRepository extends JpaRepository<ContentRegenerationJob, UUID> {

    // API-03/SEC-04: job chỉ đọc được bởi chủ nhân (qua version → item → brand profile → user).
    Optional<ContentRegenerationJob> findByIdAndContentVersion_ContentItem_BrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);
}
