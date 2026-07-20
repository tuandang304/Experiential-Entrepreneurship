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
 * Một thẻ số liệu của Bảng điều khiển.
 *
 * <p>{@code total} là số tích lũy (toàn bộ lịch sử), còn {@code deltaPct} và {@code series} là số
 * theo LƯỢNG BÀI TẠO RA trong kỳ: {@code deltaPct} so 7 ngày qua với 7 ngày liền trước,
 * {@code series} là số bài mỗi ngày của 7 ngày gần nhất (vẽ sparkline).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardStatResponse", description = "Thẻ số liệu: tổng tích lũy + % thay đổi 7 ngày + chuỗi sparkline.")
public class DashboardStatResponse {

    @Schema(description = "Tổng tích lũy tính đến hiện tại.", example = "42")
    long total;

    @Schema(description = "% thay đổi 7 ngày qua so với 7 ngày liền trước; null khi kỳ trước bằng 0 (FE hiển thị '—').",
            example = "12.5")
    Double deltaPct;

    @Schema(description = "Số bài tạo ra mỗi ngày của 7 ngày gần nhất (cũ → mới), dùng vẽ sparkline.")
    List<Long> series;
}
