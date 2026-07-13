package com.aima.service.Impl;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.TokenUsageResponse;
import com.aima.entity.Plan;
import com.aima.entity.User;
import com.aima.enums.UserPlan;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.UserMapper;
import com.aima.repository.PlanRepository;
import com.aima.repository.UserRepository;
import com.aima.service.TokenUsageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenUsageServiceImpl implements TokenUsageService {

    UserRepository userRepository;
    PlanRepository planRepository;
    UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TokenUsageResponse> getMyUsage(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        TokenUsageResponse response = userMapper.toTokenUsageResponse(user, currentUsed(user), resolveLimit(user));
        return ApiResponse.success("Lấy mức dùng token thành công", response);
    }

    @Override
    public void checkQuota(User user) {
        Long limit = resolveLimit(user);
        if (limit != null && currentUsed(user) >= limit) {
            throw new AppException(ErrorCode.TOKEN_QUOTA_EXCEEDED);
        }
    }

    @Override
    public void record(User user, Long tokens) {
        long amount = tokens == null ? 0L : tokens;
        if (amount <= 0) {
            return;
        }
        // Reset lazy: sang tháng mới thì mức dùng bắt đầu lại từ 0.
        String month = currentMonth();
        long base = month.equals(user.getTokenUsageMonth())
                ? (user.getTokensUsed() == null ? 0L : user.getTokensUsed())
                : 0L;
        user.setTokenUsageMonth(month);
        user.setTokensUsed(base + amount);
        userRepository.save(user);
    }

    private long currentUsed(User user) {
        if (!currentMonth().equals(user.getTokenUsageMonth()) || user.getTokensUsed() == null) {
            return 0L;
        }
        return user.getTokensUsed();
    }

    // Hạn mức lấy từ row Plan theo code = user.plan (3 gói lõi khớp enum UserPlan).
    // Thiếu row (DB chưa seed) → null = không chặn, chỉ log để không khóa nhầm user.
    private Long resolveLimit(User user) {
        String code = user.getPlan() == null ? UserPlan.FREE.name() : user.getPlan().name();
        return planRepository.findByCodeAndDeletedAtIsNull(code)
                .map(Plan::getMonthlyTokenLimit)
                .orElseGet(() -> {
                    log.warn("[TokenUsage] Không tìm thấy gói {} — bỏ qua hạn mức token", code);
                    return null;
                });
    }

    private static String currentMonth() {
        return YearMonth.now().toString(); // "2026-07"
    }
}
