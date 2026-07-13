package com.aima.service;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.TokenUsageResponse;
import com.aima.entity.User;

/**
 * Hạn mức token LLM theo tháng (Plan.monthlyTokenLimit — FREE 1.000 / PLUS 100.000 /
 * PRO 1.000.000). Reset "lazy" đầu mỗi tháng: User.tokenUsageMonth ("yyyy-MM") khác
 * tháng hiện tại thì mức dùng coi như 0 — không cần scheduler.
 */
public interface TokenUsageService {

    /** GET /users/me/token-usage — mức dùng/hạn mức tháng này cho thanh usage ở sidebar. */
    ApiResponse<TokenUsageResponse> getMyUsage(String email);

    /** Chặn tác vụ AI mới khi user đã dùng hết hạn mức tháng (TOKEN_QUOTA_EXCEEDED). */
    void checkQuota(User user);

    /** Cộng token thật (usage_metadata từ AI service) vào mức dùng tháng; gọi trong transaction đang mở. */
    void record(User user, Long tokens);
}
