package com.aima.service;

import com.aima.dto.response.AnalyzedPostResponse;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.PageResponse;

import java.util.UUID;

public interface PostAnalyticsService {

    ApiResponse<PageResponse<AnalyzedPostResponse>> list(String email, int page, int size);

    ApiResponse<AnalyzedPostResponse> get(String email, UUID postId);
}
