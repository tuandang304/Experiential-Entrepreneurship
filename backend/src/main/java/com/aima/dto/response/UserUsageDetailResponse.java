package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

/**
 * Chi tiết usage một user cho admin (GET /admin/usage/users/{id}) — thông tin user +
 * cùng khối usage như trang user ({@link UserUsageResponse}) + lịch sử điều chỉnh kỳ này.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUsageDetailResponse {

    UUID userId;

    String email;

    String fullName;

    String avatarUrl;

    UserUsageResponse usage;

    /**
     * Tổng phần vượt hạn mức kỳ này mà credit KHÔNG đủ trả (event đã gọi AI xong nên cho
     * phép âm, không rollback) — lượng "rò" qua chỗ chặn, admin theo dõi tại đây.
     */
    Long creditShortfall;

    List<UsageAdjustmentResponse> adjustments;
}
