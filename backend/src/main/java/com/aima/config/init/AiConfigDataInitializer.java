package com.aima.config.init;

import com.aima.config.AiConfigProperties;
import com.aima.entity.AiModel;
import com.aima.entity.AiProvider;
import com.aima.entity.AiTaskRouting;
import com.aima.enums.AiProviderCode;
import com.aima.enums.AiTaskCode;
import com.aima.repository.AiModelRepository;
import com.aima.repository.AiProviderRepository;
import com.aima.repository.AiTaskRoutingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Seed cấu hình AI theo DB (chạy sau {@code PlanDataInitializer}):
 * <ul>
 *   <li>2 provider ANTHROPIC/GOOGLE — key lấy từ env seed (AI_SEED_*_API_KEY, tuỳ chọn,
 *       chỉ áp khi TẠO MỚI row), luôn {@code enabled=false}: không kích hoạt gì cho tới khi
 *       admin dán key + bật qua UI.</li>
 *   <li>1 model mặc định mỗi provider (khớp default của ai/src/config.py).</li>
 *   <li>Routing mặc định cho đủ 6 task: primary = model Anthropic (khớp LLM_PROVIDER=anthropic
 *       mặc định của AI service), fallback = model Google, max_tokens 16000 (= LLM_MAX_TOKENS).</li>
 *   <li>Partial unique index (WHERE deleted_at IS NULL) — JPA không khai báo được.</li>
 * </ul>
 * Idempotent theo từng row. Dùng cách này thay Flyway/Liquibase vì dự án đang dùng
 * {@code ddl-auto: update} (cùng mẫu {@code PlatformDataInitializer}).
 * KHÔNG log key dưới mọi hình thức.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(5)
@EnableConfigurationProperties(AiConfigProperties.class)
public class AiConfigDataInitializer implements CommandLineRunner {

    /** max_tokens mặc định cho routing — khớp LLM_MAX_TOKENS của ai/.env.example. */
    static final int DEFAULT_MAX_TOKENS = 16000;

    /** Model mặc định khi env seed không chỉ định — khớp default của ai/src/config.py. */
    static final String DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";
    static final String DEFAULT_GOOGLE_MODEL = "gemini-2.5-pro";

    AiProviderRepository providerRepository;
    AiModelRepository modelRepository;
    AiTaskRoutingRepository routingRepository;
    AiConfigProperties properties;
    JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        AiConfigProperties.Seed seed = properties.seed();

        AiProvider anthropic = seedProvider(AiProviderCode.ANTHROPIC, "Anthropic (Claude)", seed.anthropicApiKey());
        AiProvider google = seedProvider(AiProviderCode.GOOGLE, "Google (Gemini)", seed.googleApiKey());

        AiModel anthropicModel = seedModel(anthropic, defaultIfBlank(seed.anthropicModel(), DEFAULT_ANTHROPIC_MODEL));
        AiModel googleModel = seedModel(google, defaultIfBlank(seed.googleModel(), DEFAULT_GOOGLE_MODEL));

        seedRouting(anthropicModel, googleModel);
        createPartialUniqueIndexes();
    }

    private AiProvider seedProvider(AiProviderCode code, String name, String apiKey) {
        return providerRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseGet(() -> {
                    boolean hasKey = apiKey != null && !apiKey.isBlank();
                    AiProvider provider = AiProvider.builder()
                            .code(code)
                            .name(name)
                            .apiKey(hasKey ? apiKey : null)
                            .enabled(false)
                            .build();
                    AiProvider saved = providerRepository.save(provider);
                    log.info("[AiConfigInit] Seeded provider {} (disabled, key: {})",
                            code, hasKey ? "từ env seed" : "chưa có");
                    return saved;
                });
    }

    private AiModel seedModel(AiProvider provider, String modelCode) {
        return modelRepository.findByProviderAndModelCodeAndDeletedAtIsNull(provider, modelCode)
                .orElseGet(() -> {
                    AiModel model = AiModel.builder()
                            .provider(provider)
                            .modelCode(modelCode)
                            .displayName(modelCode)
                            .enabled(true)
                            .build();
                    AiModel saved = modelRepository.save(model);
                    log.info("[AiConfigInit] Seeded model {} ({})", modelCode, provider.getCode());
                    return saved;
                });
    }

    private void seedRouting(AiModel primaryModel, AiModel fallbackModel) {
        for (AiTaskCode task : AiTaskCode.values()) {
            if (routingRepository.findByTaskCodeAndDeletedAtIsNull(task).isPresent()) {
                continue;
            }
            AiTaskRouting routing = AiTaskRouting.builder()
                    .taskCode(task)
                    .primaryModel(primaryModel)
                    .fallbackModel(fallbackModel)
                    .maxTokens(DEFAULT_MAX_TOKENS)
                    .enabled(true)
                    .build();
            routingRepository.save(routing);
            log.info("[AiConfigInit] Seeded routing {} → {} (fallback {})",
                    task, primaryModel.getModelCode(), fallbackModel.getModelCode());
        }
    }

    // Unique "còn sống" (bỏ qua row đã soft-delete) — từng index một để một lỗi không chặn các index còn lại.
    private void createPartialUniqueIndexes() {
        String[] statements = {
                "CREATE UNIQUE INDEX IF NOT EXISTS uk_ai_providers_code " +
                        "ON ai_providers (code) WHERE deleted_at IS NULL",
                "CREATE UNIQUE INDEX IF NOT EXISTS uk_ai_models_provider_model " +
                        "ON ai_models (provider_id, model_code) WHERE deleted_at IS NULL",
                "CREATE UNIQUE INDEX IF NOT EXISTS uk_ai_task_routing_task_code " +
                        "ON ai_task_routing (task_code) WHERE deleted_at IS NULL"
        };
        for (String sql : statements) {
            try {
                jdbcTemplate.execute(sql);
            } catch (Exception e) {
                log.warn("[AiConfigInit] Tạo partial unique index bỏ qua: {}", e.getMessage());
            }
        }
        log.info("[AiConfigInit] Partial unique index cho ai_providers/ai_models/ai_task_routing đã sẵn sàng.");
    }

    private static String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
