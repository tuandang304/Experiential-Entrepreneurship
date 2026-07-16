package com.aima.repository;

import com.aima.entity.AiTaskRouting;
import com.aima.enums.AiTaskCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiTaskRoutingRepository extends JpaRepository<AiTaskRouting, UUID> {

    Optional<AiTaskRouting> findByTaskCodeAndDeletedAtIsNull(AiTaskCode taskCode);
}
