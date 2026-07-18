package com.aima.enums;

/**
 * Nhà cung cấp LLM — khớp giá trị {@code llm_provider} phía AI service ({@code ai/src/config.py}).
 * {@code UNKNOWN} chỉ dùng cho bản ghi {@code ai_usage} khi AI service chạy bằng env
 * (config DB không hiệu lực — backend không biết model thật sự chạy); không bao giờ
 * gửi sang AI service làm llm_provider.
 */
public enum AiProviderCode {
    ANTHROPIC,
    GOOGLE,
    UNKNOWN
}
