package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tab "Phiên & thiết bị" trang chi tiết user — IP/UA distinct từ event log + số session
 * đồng thời (set Redis user_rt). Chứa IP = dữ liệu cá nhân → endpoint GHI AUDIT mỗi lần gọi.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSessionsResponse {

    /** Số refresh token đang sống (≈ session đồng thời). */
    Long activeSessionCount;

    List<SessionRow> recentClients;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SessionRow {

        String clientIp;

        String userAgent;

        Long requestCount;

        LocalDateTime lastSeenAt;
    }
}
