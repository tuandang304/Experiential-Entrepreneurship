package com.aima.repository;

import com.aima.entity.ContentGenerationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentGenerationJobRepository extends JpaRepository<ContentGenerationJob, UUID> {
    Optional<ContentGenerationJob> findByIdAndContentStrategy_BrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);
}
