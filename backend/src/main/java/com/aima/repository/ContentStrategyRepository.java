package com.aima.repository;

import com.aima.entity.ContentStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentStrategyRepository extends JpaRepository<ContentStrategy, UUID> {
    List<ContentStrategy> findByBrandProfile_IdAndDeletedAtIsNull(UUID brandId);
    List<ContentStrategy> findByBrandProfile_User_IdAndDeletedAtIsNull(UUID userId);
    Optional<ContentStrategy> findByIdAndBrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);
}
