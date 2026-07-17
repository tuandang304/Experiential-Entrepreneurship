package com.aima.service.Impl;

import com.aima.config.AiConfigProperties;
import com.aima.dto.ai.LlmConfigPayload;
import com.aima.dto.ai.LlmSpecPayload;
import com.aima.entity.AiModel;
import com.aima.entity.AiTaskRouting;
import com.aima.enums.AiModelBlockReason;
import com.aima.enums.AiTaskCode;
import com.aima.mapper.AiConfigMapper;
import com.aima.repository.AiTaskRoutingRepository;
import com.aima.service.AiRuntimeConfigService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cache kết quả resolve theo task (kể cả kết quả "không hiệu lực" = null) trong 5 phút —
 * tránh mỗi job AI một lượt query routing/provider. Evict tường minh khi admin lưu.
 * Payload trong cache chứa key ĐÃ GIẢI MÃ (in-memory, tương đương entity sau converter) —
 * KHÔNG log payload/spec.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@EnableConfigurationProperties(AiConfigProperties.class)
public class AiRuntimeConfigServiceImpl implements AiRuntimeConfigService {

    static final Duration CACHE_TTL = Duration.ofMinutes(5);

    AiTaskRoutingRepository routingRepository;
    AiConfigProperties properties;
    AiConfigMapper aiConfigMapper;

    final ConcurrentHashMap<AiTaskCode, CachedRouting> cache = new ConcurrentHashMap<>();

    /** payload/activeModel null = task này không dùng config DB (đường env). */
    private record CachedRouting(LlmConfigPayload payload, ActiveModel activeModel, LocalDateTime cachedAt) {
        boolean isFresh() {
            return Duration.between(cachedAt, LocalDateTime.now()).compareTo(CACHE_TTL) < 0;
        }
    }

    @Override
    public LlmConfigPayload getLlmConfig(AiTaskCode taskCode) {
        return resolved(taskCode).payload();
    }

    @Override
    public ActiveModel getActiveModel(AiTaskCode taskCode) {
        return resolved(taskCode).activeModel();
    }

    @Override
    public void evictCache() {
        cache.clear();
    }

    private CachedRouting resolved(AiTaskCode taskCode) {
        CachedRouting cached = cache.get(taskCode);
        if (cached != null && cached.isFresh()) {
            return cached;
        }
        CachedRouting fresh = resolve(taskCode);
        cache.put(taskCode, fresh);
        return fresh;
    }

    // Không @Transactional (self-invocation không qua proxy) — repo fetch-join đủ model/provider.
    private CachedRouting resolve(AiTaskCode taskCode) {
        if (!properties.fromDb()) {
            return inactive();
        }
        AiTaskRouting routing = routingRepository.findWithModelsByTaskCode(taskCode).orElse(null);
        if (routing == null || !Boolean.TRUE.equals(routing.getEnabled())) {
            return inactive();
        }
        AiModel primary = routing.getPrimaryModel();
        if (!usable(primary)) {
            log.warn("[AiRuntimeConfig] Task {} có routing nhưng model chính không hiệu lực "
                    + "(model/provider tắt hoặc thiếu key) — dùng cấu hình env.", taskCode);
            return inactive();
        }

        LlmSpecPayload primarySpec = aiConfigMapper.toLlmSpec(primary, routing);
        LlmSpecPayload fallbackSpec = usable(routing.getFallbackModel())
                ? aiConfigMapper.toLlmSpec(routing.getFallbackModel(), routing)
                : null;
        LlmConfigPayload payload = aiConfigMapper.toLlmConfig(primarySpec, fallbackSpec);
        ActiveModel activeModel = new ActiveModel(primary.getProvider().getCode(), primary.getModelCode(),
                primary.getInputPricePer1m(), primary.getOutputPricePer1m());
        return new CachedRouting(payload, activeModel, LocalDateTime.now());
    }

    @Override
    public AiModelBlockReason blockReason(AiModel model) {
        if (model == null || model.getDeletedAt() != null) {
            return AiModelBlockReason.MODEL_DELETED;
        }
        if (!Boolean.TRUE.equals(model.getEnabled())) {
            return AiModelBlockReason.MODEL_DISABLED;
        }
        if (!Boolean.TRUE.equals(model.getProvider().getEnabled())) {
            return AiModelBlockReason.PROVIDER_DISABLED;
        }
        if (model.getProvider().getApiKey() == null || model.getProvider().getApiKey().isBlank()) {
            return AiModelBlockReason.PROVIDER_KEY_MISSING;
        }
        return null;
    }

    /** Luật "dùng được" tập trung ở {@link #blockReason(AiModel)} — một nguồn sự thật. */
    private boolean usable(AiModel model) {
        return blockReason(model) == null;
    }

    private CachedRouting inactive() {
        return new CachedRouting(null, null, LocalDateTime.now());
    }
}
