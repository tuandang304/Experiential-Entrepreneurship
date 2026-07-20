package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một điểm trên biểu đồ "Hiệu suất nội dung" (2 đường: lượt tiếp cận + lượt tương tác).
 * Ngày không có bài đăng vẫn được trả về với giá trị 0 để đường liền mạch.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardPointResponse", description = "Điểm dữ liệu theo ngày của biểu đồ hiệu suất.")
public class DashboardPointResponse {

    @Schema(description = "Ngày đăng, định dạng yyyy-MM-dd.", example = "2026-07-21")
    String date;

    @Schema(description = "Lượt tiếp cận (views) cộng dồn của các bài đăng trong ngày.", example = "1280")
    long reach;

    @Schema(description = "Lượt tương tác (likes + comments + shares) của các bài đăng trong ngày.", example = "154")
    long engagement;
}
