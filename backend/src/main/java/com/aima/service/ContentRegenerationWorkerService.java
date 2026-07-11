package com.aima.service;

import java.util.UUID;

/**
 * Worker nền (@Async) cho tác vụ tạo lại từng phần kịch bản — bean riêng để proxy @Async hoạt động
 * (tránh self-invocation), cùng mẫu với ContentGenerationWorkerService.
 */
public interface ContentRegenerationWorkerService {

    void process(UUID jobId);
}
