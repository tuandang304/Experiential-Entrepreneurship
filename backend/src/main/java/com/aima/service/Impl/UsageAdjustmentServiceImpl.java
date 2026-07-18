package com.aima.service.Impl;

import com.aima.dto.request.GrantTokensRequest;
import com.aima.dto.request.ResetUsageRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.UsageAdjustmentResponse;
import com.aima.entity.UsageAdjustment;
import com.aima.entity.User;
import com.aima.enums.UsageAdjustmentSource;
import com.aima.enums.UsageAdjustmentType;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.UsageMapper;
import com.aima.repository.UsageAdjustmentRepository;
import com.aima.repository.UserRepository;
import com.aima.service.UsageAdjustmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UsageAdjustmentServiceImpl implements UsageAdjustmentService {

    UserRepository userRepository;
    UsageAdjustmentRepository usageAdjustmentRepository;
    UsageMapper usageMapper;

    @Override
    @Transactional
    public ApiResponse<UsageAdjustmentResponse> grant(String actorEmail, UUID userId, GrantTokensRequest request) {
        if (request.getTokens() == null || request.getTokens() <= 0) {
            throw new AppException(ErrorCode.USAGE_ADJUSTMENT_INVALID);
        }
        UsageAdjustmentResponse response = record(actorEmail, userId, UsageAdjustmentType.GRANT,
                request.getTokens(), request.getReason());
        return ApiResponse.success("Đã cấp thêm token cho người dùng", response);
    }

    @Override
    @Transactional
    public ApiResponse<UsageAdjustmentResponse> reset(String actorEmail, UUID userId, ResetUsageRequest request) {
        UsageAdjustmentResponse response = record(actorEmail, userId, UsageAdjustmentType.RESET,
                null, request == null ? null : request.getReason());
        return ApiResponse.success("Đã reset mức dùng kỳ này của người dùng", response);
    }

    private UsageAdjustmentResponse record(String actorEmail, UUID userId, UsageAdjustmentType type,
                                           Long deltaTokens, String reason) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UsageAdjustment adjustment = usageMapper.toAdjustment(user, actor, type,
                UsageAdjustmentSource.ADMIN_GRANT, deltaTokens, reason, YearMonth.now().toString());
        UsageAdjustment saved = usageAdjustmentRepository.save(adjustment);
        log.info("[Usage] {} bởi {} cho user {} ({} token) — lý do: {}",
                type, actorEmail, user.getEmail(), deltaTokens, reason);
        return usageMapper.toAdjustmentResponse(saved);
    }
}
