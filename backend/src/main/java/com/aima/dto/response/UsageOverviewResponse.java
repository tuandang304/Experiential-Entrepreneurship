package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Tab Tổng quan trang admin "Token & hạn mức" (GET /admin/usage/overview) — toàn bộ số liệu
 * GỘP TỪ ROLLUP usage_hourly (không query thẳng event). Kỳ = tháng lịch hiện tại.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageOverviewResponse {

    LocalDateTime periodStart;

    LocalDateTime periodEnd;

    /** Token thô toàn hệ thống kỳ này (đơn vị hoạt động, không phải billable). */
    Long totalTokens;

    Long billableUnits;

    /** Phần trả bằng token mua thêm (tách token gói / token lẻ). */
    Long creditUnits;

    BigDecimal costUsd;

    Long requests;

    Long errors;

    /** Token kỳ trước (so sánh); null khi kỳ trước không có dữ liệu. */
    Long prevTotalTokens;

    /** % thay đổi token so kỳ trước; null khi kỳ trước = 0 (không chia được). */
    Long tokenDeltaPct;

    List<UsageTaskStatResponse> topFeatures;

    List<UsageModelStatResponse> topModels;

    List<UsageTopUserResponse> topUsers;
}
