package com.aima.enums;

/**
 * Lý do một model không dùng được trong định tuyến AI — cùng luật với
 * {@code AiRuntimeConfigService.blockReason(AiModel)} (một nguồn sự thật).
 */
public enum AiModelBlockReason {
    MODEL_DELETED,
    MODEL_DISABLED,
    PROVIDER_DISABLED,
    PROVIDER_KEY_MISSING
}
