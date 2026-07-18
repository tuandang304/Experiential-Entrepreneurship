package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Một dòng tab admin "Theo người dùng": mức dùng hiệu lực kỳ này so hạn mức gói —
 * lọc "sắp chạm (≥80%)" / "đã vượt (≥100%)" tính từ used/limit. {@code limit} null
 * = không giới hạn.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUsageRowResponse {

    UUID userId;

    String email;

    String fullName;

    String avatarUrl;

    String planCode;

    Long used;

    Long limit;
}
