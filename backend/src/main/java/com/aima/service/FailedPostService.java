package com.aima.service;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.FailedPostResponse;
import com.aima.dto.response.FailedPostSummaryResponse;
import com.aima.dto.response.PageResponse;
import com.aima.enums.FailedPostFilter;

/**
 * Trung tâm hồi phục bài lỗi của CHÍNH user (FR-35..FR-39) — khác góc nhìn admin (FR-82/83/84).
 */
public interface FailedPostService {

    ApiResponse<PageResponse<FailedPostResponse>> list(String email, FailedPostFilter filter, int page, int size);

    ApiResponse<FailedPostSummaryResponse> summary(String email);
}
