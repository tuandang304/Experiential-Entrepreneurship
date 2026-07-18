package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Một bucket GIỜ cho heatmap (GET /admin/usage/heatmap) — bucket theo GIỜ VIỆT NAM
 * (quy ước UsageHourly.hourBucket). FE tự chọn metric hiển thị phía client.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HeatmapPointResponse {

    LocalDateTime bucket;

    Long totalTokens;

    Long requests;

    Long errors;

    BigDecimal costUsd;

    /** Trung bình = latencySum / latencyCount, LOẠI event không có latency; null khi không đo được. */
    Long latencyAvgMs;
}
