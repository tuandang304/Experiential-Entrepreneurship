package com.aima.repository;

import com.aima.entity.AiModelPriceCatalog;
import com.aima.enums.AiProviderCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiModelPriceCatalogRepository extends JpaRepository<AiModelPriceCatalog, UUID> {

    Optional<AiModelPriceCatalog> findByProviderCodeAndModelCodeAndDeletedAtIsNull(
            AiProviderCode providerCode, String modelCode);

    List<AiModelPriceCatalog> findByProviderCodeAndDeletedAtIsNull(AiProviderCode providerCode);
}
