package com.aima.service;

import com.aima.dto.request.RegeneratePartRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentRegenerationJobResponse;

import java.util.UUID;

/**
 * Tạo lại MỘT phần kịch bản của một ContentVersion (async, NFR-04) — start trả job ngay, FE poll.
 */
public interface ContentRegenerationService {

    /** Khởi động job tạo lại một phần của version (thuộc bài itemId). */
    ApiResponse<ContentRegenerationJobResponse> startRegeneration(String email, UUID itemId, UUID versionId, RegeneratePartRequest request);

    /** Poll trạng thái job — trả patch khi SUCCESS. */
    ApiResponse<ContentRegenerationJobResponse> getJob(String email, UUID jobId);
}
