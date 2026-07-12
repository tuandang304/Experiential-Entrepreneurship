package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "UserStatsResponse", description = "Số liệu tổng quan người dùng cho stat card trang Quản trị (FR-80).")
public class UserStatsResponse {

    @Schema(description = "Tổng số người dùng (chưa xoá).", example = "143")
    long total;

    @Schema(description = "Số tài khoản đang hoạt động.", example = "128")
    long active;

    @Schema(description = "Số tài khoản bị khoá.", example = "6")
    long locked;

    @Schema(description = "Số tài khoản được tạo trong tháng hiện tại.", example = "12")
    long newThisMonth;
}
