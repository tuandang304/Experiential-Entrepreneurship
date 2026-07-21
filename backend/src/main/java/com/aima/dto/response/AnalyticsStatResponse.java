package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Một thẻ KPI của trang Phân tích (Lượt xem / Lượt thích / Bình luận / Chia sẻ).
 *
 * <p>{@code total} là tổng của metric trong kỳ đang chọn; {@code deltaPct} so với kỳ liền trước
 * (cùng độ dài); {@code series} là giá trị mỗi ngày của kỳ (cũ → mới) để vẽ sparkline mini.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "AnalyticsStatResponse", description = "Thẻ KPI Phân tích: tổng trong kỳ + % thay đổi so kỳ trước + chuỗi sparkline.")
public class AnalyticsStatResponse {

    @Schema(description = "Tổng của metric trong kỳ đang chọn.", example = "12480")
    long total;

    @Schema(description = "% thay đổi so với kỳ liền trước cùng độ dài; null khi kỳ trước bằng 0 (FE hiển thị '—').",
            example = "12.5")
    Double deltaPct;

    @Schema(description = "Giá trị metric mỗi ngày trong kỳ (cũ → mới), dùng vẽ sparkline mini.")
    List<Long> series;
}
