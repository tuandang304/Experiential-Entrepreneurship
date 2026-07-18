package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * IP/User-Agent của MỘT event — dữ liệu cá nhân, endpoint trả nó GHI AUDIT mỗi lần gọi
 * (admin nào xem, xem của user nào, lúc nào — system_logs module admin.usage.meta).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageEventMetaResponse {

    String clientIp;

    String userAgent;
}
