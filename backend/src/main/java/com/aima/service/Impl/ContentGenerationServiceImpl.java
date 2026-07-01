package com.aima.service.Impl;

import com.aima.dto.request.ContentGenerationRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentGenerationJobResponse;
import com.aima.entity.ContentGenerationJob;
import com.aima.entity.ContentStrategy;
import com.aima.entity.User;
import com.aima.enums.GenerationJobStatus;
import com.aima.enums.StrategyStatus;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.ContentGenerationJobMapper;
import com.aima.repository.ContentGenerationJobRepository;
import com.aima.repository.ContentStrategyRepository;
import com.aima.repository.UserRepository;
import com.aima.service.ContentGenerationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional
public class ContentGenerationServiceImpl implements ContentGenerationService {

    ContentGenerationJobRepository contentGenerationJobRepository;
    ContentStrategyRepository contentStrategyRepository;
    UserRepository userRepository;
    ContentGenerationJobMapper contentGenerationJobMapper;
    ContentGenerationWorker contentGenerationWorker;

    // BR-01, BR-03, FR-13: chỉ chiến lược ACTIVE mới được tạo nội dung.
    @Override
    public ApiResponse<ContentGenerationJobResponse> startGeneration(String email, ContentGenerationRequest request) {
        User user = currentUser(email);
        ContentStrategy strategy = contentStrategyRepository
                .findByIdAndBrandProfile_User_IdAndDeletedAtIsNull(request.getStrategyId(), user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTENT_STRATEGY_NOT_FOUND));
        if (strategy.getStatus() != StrategyStatus.ACTIVE) {
            throw new AppException(ErrorCode.STRATEGY_NOT_ACTIVE);
        }

        ContentGenerationJob job = new ContentGenerationJob();
        job.setContentStrategy(strategy);
        job.setPlatform(request.getPlatform());
        job.setTopic(request.getTopic());
        job.setRegenerateFrom(request.getRegenerateFrom());
        job.setStatus(GenerationJobStatus.PENDING);
        ContentGenerationJob saved = contentGenerationJobRepository.save(job);

        // Chỉ dispatch worker nền SAU KHI transaction commit — nếu không, thread @Async có thể
        // truy vấn job trước khi row này được ghi xuống DB (rule #24, cùng mẫu với
        // UserServiceImpl.scheduleOldAvatarDeletion).
        UUID jobId = saved.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    contentGenerationWorker.process(jobId);
                }
            });
        } else {
            contentGenerationWorker.process(jobId);
        }

        return ApiResponse.success("Đã bắt đầu tạo nội dung",
                contentGenerationJobMapper.toContentGenerationJobResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ContentGenerationJobResponse> getJob(String email, UUID jobId) {
        User user = currentUser(email);
        ContentGenerationJob job = contentGenerationJobRepository
                .findByIdAndContentStrategy_BrandProfile_User_IdAndDeletedAtIsNull(jobId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTENT_GENERATION_JOB_NOT_FOUND));
        return ApiResponse.success("Lấy trạng thái tác vụ tạo nội dung thành công",
                contentGenerationJobMapper.toContentGenerationJobResponse(job));
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
