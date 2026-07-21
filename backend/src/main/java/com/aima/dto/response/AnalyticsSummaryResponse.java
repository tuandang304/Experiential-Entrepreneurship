package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Tổng quan Phân tích (khối B): 4 thẻ KPI kèm % thay đổi so với kỳ liền trước và sparkline.
 * {@code compareFrom}/{@code compareTo} là khoảng của kỳ so sánh để FE gắn nhãn "so với ...".
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "AnalyticsSummaryResponse", description = "4 thẻ KPI của trang Phân tích kèm so sánh kỳ trước.")
public class AnalyticsSummaryResponse {

    @Schema(description = "Ngày bắt đầu kỳ đang chọn (yyyy-MM-dd).", example = "2026-07-15")
    String from;

    @Schema(description = "Ngày kết thúc kỳ đang chọn (yyyy-MM-dd, đã bao gồm).", example = "2026-07-21")
    String to;

    @Schema(description = "Số ngày của kỳ.", example = "7")
    int rangeDays;

    @Schema(description = "Ngày bắt đầu kỳ so sánh (yyyy-MM-dd).", example = "2026-07-08")
    String compareFrom;

    @Schema(description = "Ngày kết thúc kỳ so sánh (yyyy-MM-dd).", example = "2026-07-14")
    String compareTo;

    @Schema(description = "Lượt xem.")
    AnalyticsStatResponse views;

    @Schema(description = "Lượt thích.")
    AnalyticsStatResponse likes;

    @Schema(description = "Bình luận.")
    AnalyticsStatResponse comments;

    @Schema(description = "Chia sẻ.")
    AnalyticsStatResponse shares;
}
