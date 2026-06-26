package com.aima.service;

import com.aima.dto.request.ContentStrategyRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentStrategyResponse;
import com.aima.enums.StrategyStatus;

import java.util.List;
import java.util.UUID;

public interface ContentStrategyService {
    ApiResponse<ContentStrategyResponse> create(String email, ContentStrategyRequest request);
    // brandId null → toàn bộ chiến lược của user; có brandId → lọc theo brand (BR-02).
    ApiResponse<List<ContentStrategyResponse>> list(String email, UUID brandId);
    ApiResponse<ContentStrategyResponse> get(String email, UUID id);
    ApiResponse<ContentStrategyResponse> update(String email, UUID id, ContentStrategyRequest request);
    ApiResponse<ContentStrategyResponse> updateStatus(String email, UUID id, StrategyStatus status);
    ApiResponse<Void> delete(String email, UUID id);
}
