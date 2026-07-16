package com.aima.repository;

import com.aima.entity.AiModel;
import com.aima.entity.AiProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiModelRepository extends JpaRepository<AiModel, UUID> {

    Optional<AiModel> findByProviderAndModelCodeAndDeletedAtIsNull(AiProvider provider, String modelCode);
}
