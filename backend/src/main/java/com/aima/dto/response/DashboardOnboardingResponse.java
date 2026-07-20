package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * FR-86 — tiến độ thiết lập 4 bước. KHÔNG lưu trong DB: mỗi bước được SUY RA từ dữ liệu thật
 * (có hồ sơ thương hiệu / có kết nối ACTIVE / có chiến lược / có bài viết) nên luôn đúng kể cả
 * khi user xóa dữ liệu về sau. FE ẩn khối này khi {@code completed == total}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardOnboardingResponse", description = "Tiến độ thiết lập 4 bước, suy ra từ dữ liệu thật.")
public class DashboardOnboardingResponse {

    @Schema(description = "Đã tạo ít nhất một hồ sơ thương hiệu.")
    boolean brand;

    @Schema(description = "Đã có ít nhất một kết nối mạng xã hội ở trạng thái ACTIVE.")
    boolean connection;

    @Schema(description = "Đã tạo ít nhất một chiến lược nội dung.")
    boolean strategy;

    @Schema(description = "Đã tạo ít nhất một bài viết.")
    boolean content;

    @Schema(description = "Số bước đã hoàn tất.", example = "3")
    int completed;

    @Schema(description = "Tổng số bước (luôn là 4).", example = "4")
    int total;
}
