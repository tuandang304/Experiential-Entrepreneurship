package com.aima.service;

import com.aima.dto.request.GrantTokensRequest;
import com.aima.dto.request.ResetUsageRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.UsageAdjustmentResponse;

import java.util.UUID;

/**
 * Admin điều chỉnh usage token của user — mỗi thao tác là MỘT bản ghi append-only trong
 * {@code usage_adjustments} (kiêm audit log: actor + lý do + thời điểm). GRANT trừ vào
 * mức dùng hiệu lực (mở lại user bị chặn 100% tức thì); RESET đặt mốc tính lại từ 0.
 */
public interface UsageAdjustmentService {

    /** POST /admin/usage/users/{id}/grant — cấp thêm token trong kỳ hiện tại. */
    ApiResponse<UsageAdjustmentResponse> grant(String actorEmail, UUID userId, GrantTokensRequest request);

    /** POST /admin/usage/users/{id}/reset — reset mức dùng kỳ hiện tại về 0 (từ bây giờ). */
    ApiResponse<UsageAdjustmentResponse> reset(String actorEmail, UUID userId, ResetUsageRequest request);
}
