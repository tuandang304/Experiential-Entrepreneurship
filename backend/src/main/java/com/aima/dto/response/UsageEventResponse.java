package com.aima.dto.response;

import com.aima.enums.AiProviderCode;
import com.aima.enums.AiTaskCode;
import com.aima.enums.AiUsageStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Một dòng tab "Nhật ký sử dụng" (event ai_usage). CỐ Ý KHÔNG chứa IP/User-Agent —
 * đó là dữ liệu cá nhân, chỉ trả qua GET /admin/usage/events/{id}/meta (có audit ai xem).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageEventResponse {

    UUID id;

    LocalDateTime createdAt;

    String userEmail;

    String userFullName;

    AiTaskCode taskCode;

    AiProviderCode providerCode;

    String modelCode;

    /** null = "không biết" (event lỗi / provider không báo) — KHÁC 0. */
    Long inputTokens;

    Long outputTokens;

    Long cachedTokens;

    Long totalTokens;

    /** Token quy đổi trừ hạn mức (row cũ null → FE hiển thị totalTokens). */
    Long billableUnits;

    Long creditUnits;

    Long latencyMs;

    BigDecimal estimatedCost;

    /** Row cũ status null đã coalesce SUCCESS ở mapper. */
    AiUsageStatus status;

    UUID requestId;
}
