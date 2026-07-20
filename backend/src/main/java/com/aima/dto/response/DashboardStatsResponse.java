package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Bốn thẻ số liệu đầu Bảng điều khiển, đếm trên BÀI VIẾT ({@code content_items}) theo trạng thái
 * hiện tại của vòng đời nội dung (docs/WORKFLOWS.md):
 *
 * <ul>
 *   <li>{@code total} — mọi bài chưa xóa.</li>
 *   <li>{@code posted} — POSTED / ANALYZING / OPTIMIZED (đã lên nền tảng).</li>
 *   <li>{@code pending} — NEED_REVIEW / APPROVED / SCHEDULED / POSTING (chờ duyệt, chờ đăng hoặc đang đăng).</li>
 *   <li>{@code rejected} — FAILED (mọi bài lỗi, gồm cả vi phạm chính sách lẫn lỗi kỹ thuật).</li>
 * </ul>
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardStatsResponse", description = "Bốn thẻ số liệu: tổng / đã đăng / đang chờ / bị từ chối.")
public class DashboardStatsResponse {

    DashboardStatResponse total;

    DashboardStatResponse posted;

    DashboardStatResponse pending;

    DashboardStatResponse rejected;
}
