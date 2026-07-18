package com.aima.service.Impl;

import com.aima.entity.Plan;
import com.aima.entity.Subscription;
import com.aima.entity.User;
import com.aima.enums.SubscriptionStatus;
import com.aima.enums.UserPlan;
import com.aima.mapper.UsageMapper;
import com.aima.repository.PlanRepository;
import com.aima.repository.SubscriptionRepository;
import com.aima.service.SubscriptionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubscriptionServiceImpl implements SubscriptionService {

    SubscriptionRepository subscriptionRepository;
    PlanRepository planRepository;
    UsageMapper usageMapper;

    @Override
    @Transactional
    public Subscription getOrCreate(User user) {
        String planCode = user.getPlan() == null ? UserPlan.FREE.name() : user.getPlan().name();
        Subscription subscription = subscriptionRepository.findWithPlanByUserId(user.getId()).orElse(null);

        if (subscription == null) {
            Plan plan = planRepository.findByCodeAndDeletedAtIsNull(planCode).orElse(null);
            if (plan == null) {
                log.warn("[Subscription] Không tìm thấy gói {} — chưa tạo được subscription cho user {}",
                        planCode, user.getId());
                return null;
            }
            YearMonth month = YearMonth.now();
            subscription = usageMapper.toSubscription(user, plan, SubscriptionStatus.ACTIVE,
                    periodStart(month), periodEnd(month));
            return subscriptionRepository.save(subscription);
        }

        // Lăn kỳ TRƯỚC khi đồng bộ gói: hết currentPeriodEnd thì kỳ mới = tháng lịch hiện tại
        // (mở cho chu kỳ khác pha sau) — thứ tự này để gói hạ chờ được áp ngay khi sang kỳ mới.
        boolean periodRolled = false;
        if (!LocalDateTime.now().isBefore(subscription.getCurrentPeriodEnd())) {
            YearMonth month = YearMonth.now();
            subscription.setCurrentPeriodStart(periodStart(month));
            subscription.setCurrentPeriodEnd(periodEnd(month));
            periodRolled = true;
        }

        // Đồng bộ gói khi admin/user đã đổi User.plan (nhãn cache) mà subscription còn trỏ gói cũ.
        // NÂNG gói áp ngay giữa kỳ; HẠ gói chỉ áp từ kỳ sau — tránh mức đã dùng (vd 900K của PRO)
        // vượt ngay hạn mức gói thấp hơn và bị chặn cứng oan giữa kỳ.
        if (!planCode.equals(subscription.getPlan().getCode())) {
            Plan newPlan = planRepository.findByCodeAndDeletedAtIsNull(planCode).orElse(null);
            if (newPlan == null) {
                log.warn("[Subscription] User.plan = {} nhưng không có row plans tương ứng — giữ gói cũ {}",
                        planCode, subscription.getPlan().getCode());
            } else if (periodRolled || !isDowngrade(subscription.getPlan(), newPlan)) {
                subscription.setPlan(newPlan);
            } else {
                log.info("[Subscription] User {} hạ gói {} → {} giữa kỳ — giữ gói cũ tới hết kỳ {}",
                        user.getId(), subscription.getPlan().getCode(), planCode,
                        subscription.getCurrentPeriodEnd());
            }
        }
        return subscriptionRepository.save(subscription);
    }

    /** Hạ gói = hạn mức token nhỏ hơn hạn mức hiện tại (null = không giới hạn, coi là cao nhất). */
    private static boolean isDowngrade(Plan current, Plan target) {
        Long currentLimit = current.getMonthlyTokenLimit();
        Long targetLimit = target.getMonthlyTokenLimit();
        if (targetLimit == null) {
            return false;
        }
        return currentLimit == null || targetLimit < currentLimit;
    }

    private static LocalDateTime periodStart(YearMonth month) {
        return month.atDay(1).atStartOfDay();
    }

    private static LocalDateTime periodEnd(YearMonth month) {
        return month.plusMonths(1).atDay(1).atStartOfDay();
    }
}
