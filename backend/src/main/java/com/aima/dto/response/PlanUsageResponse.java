package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Một dòng tab admin "Theo gói": số user đang giữ gói + tổng tiêu thụ kỳ này so hạn mức.
 * CHỈ đọc/gộp — hạn mức sửa ở trang Quản lý gói. {@code monthlyTokenLimit} là hạn mức
 * MỖI user/kỳ (null = không giới hạn); FE tự tính tổng trần = userCount × limit.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlanUsageResponse {

    UUID planId;

    String planCode;

    String planNameVi;

    String planNameEn;

    Boolean isActive;

    Long monthlyTokenLimit;

    Long userCount;

    /** Tổng token hiệu lực kỳ này của mọi user thuộc gói (gộp từ ai_usage). */
    Long totalTokens;

    /** Tổng chi phí ước tính (USD) kỳ này — chi tiêu thật, không trừ grant. */
    BigDecimal estimatedCost;
}
