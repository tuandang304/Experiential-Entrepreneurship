package com.aima.config;

import com.aima.entity.User;
import com.aima.enums.UserStatus;
import com.aima.repository.UserRepository;
import com.aima.service.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountDeletionScheduler {

    UserRepository userRepository;
    EmailService emailService;

    // Chạy lúc 00:00 mỗi ngày, dọn các tài khoản PENDING_DELETE đã quá hạn 30 ngày.
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void purgeExpiredAccounts() {
        List<User> expiredUsers = userRepository
                .findAllByStatusAndDeletionDateLessThanEqual(UserStatus.PENDING_DELETE, LocalDateTime.now());

        if (expiredUsers.isEmpty()) {
            log.info("[AccountDeletion] No expired accounts to purge.");
            return;
        }

        log.info("[AccountDeletion] Purging {} expired account(s)...", expiredUsers.size());

        // Xóa CỨNG + cascade toàn bộ dữ liệu liên quan (brand/content/post/kết nối/thông báo/job async).
        userRepository.deleteAll(expiredUsers);

        log.info("[AccountDeletion] Successfully purged {} account(s).", expiredUsers.size());
    }

    // Chạy 09:00 mỗi ngày: cảnh báo qua email các tài khoản còn ≤ 7 ngày trước khi bị xóa (gửi 1 lần).
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void warnUpcomingDeletions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threshold = now.plusDays(7);
        List<User> users = userRepository.findUsersToWarnOfDeletion(UserStatus.PENDING_DELETE, now, threshold);

        if (users.isEmpty()) {
            return;
        }

        log.info("[AccountDeletion] Sending 7-day deletion warning to {} account(s)...", users.size());
        for (User user : users) {
            long daysRemaining = Math.max(1, (ChronoUnit.HOURS.between(now, user.getDeletionDate()) + 23) / 24);
            try {
                emailService.sendAccountDeletionWarningEmail(
                        user.getEmail(), user.getFullName(), user.getDeletionDate(), daysRemaining);
                user.setDeletionWarningSentAt(now);
                userRepository.save(user);
            } catch (Exception e) {
                // Resilient: lỗi gửi mail cho 1 user không làm hỏng cả job — thử lại ở lần chạy sau.
                log.warn("[AccountDeletion] Không gửi được email cảnh báo xóa cho {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
