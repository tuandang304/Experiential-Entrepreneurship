package com.aima.service;

import com.aima.dto.request.ContentItemStatusRequest;
import com.aima.dto.request.ContentItemUpdateRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentItemResponse;
import com.aima.dto.response.PageResponse;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;

import java.time.LocalDate;
import java.util.UUID;

public interface ContentItemService {

    ApiResponse<PageResponse<ContentItemResponse>> list(String email, ContentLifecycle status, Platform platform,
                                                        String industry, LocalDate fromDate, LocalDate toDate,
                                                        String q, int page, int size);

    ApiResponse<ContentItemResponse> getItem(String email, UUID itemId);

    ApiResponse<ContentItemResponse> updateItem(String email, UUID itemId, ContentItemUpdateRequest request);

    ApiResponse<ContentItemResponse> updateStatus(String email, UUID itemId, ContentItemStatusRequest request);

    ApiResponse<ContentItemResponse> delete(String email, UUID itemId);
}
