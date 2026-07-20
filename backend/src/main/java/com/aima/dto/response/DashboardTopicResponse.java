package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một dòng của khối "Top chủ đề hiệu quả" — chủ đề lấy từ trend gắn với bài.
 * Xếp hạng kết hợp: tương tác giảm dần, hòa thì xét số bài (chủ đề chưa đăng vẫn hiện với 0 tương tác).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardTopicResponse", description = "Chủ đề kèm số bài đã dùng và tổng tương tác.")
public class DashboardTopicResponse {

    @Schema(description = "Tên chủ đề (tên trend).", example = "Back to school 2026")
    String name;

    @Schema(description = "Số bài viết đã dùng chủ đề này.", example = "5")
    long posts;

    @Schema(description = "Tổng lượt tương tác thu được từ các bài đã đăng của chủ đề.", example = "320")
    long engagement;
}
