package com.aima.scheduler;

import com.aima.entity.ContentVersion;
import com.aima.entity.Post;
import com.aima.entity.PostAnalytics;
import com.aima.enums.ContentLifecycle;
import com.aima.mapper.PostAnalyticsMapper;
import com.aima.repository.PostRepository;
import com.aima.service.MetaApiClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * FR-59/BR-09: thu thập số liệu bài đã đăng tại các mốc 24h / 48h / 7 ngày sau khi đăng.
 * Chạy mỗi giờ; mỗi bài-mốc chỉ thu một lần (query "chưa có bản ghi của mốc"). Cùng nhóm
 * scheduler gọi Meta trực tiếp như TokenValidationJob — không mở transaction quanh HTTP
 * (rule #24), lỗi từng bài chỉ log + bỏ qua, lần quét sau tự thử lại (rule #27).
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AnalyticsCollectionJob {

    static final List<Integer> MILESTONE_HOURS = List.of(24, 48, 168); // 7 ngày = 168h

    PostRepository postRepository;
    MetaApiClient metaApiClient;
    PostAnalyticsMapper postAnalyticsMapper;

    @Scheduled(fixedDelay = 3_600_000) // mỗi giờ
    public void run() {
        LocalDateTime now = LocalDateTime.now();
        for (int milestone : MILESTONE_HOURS) {
            List<Post> due = postRepository.findDueForAnalytics(milestone, now.minusHours(milestone));
            if (due.isEmpty()) {
                continue;
            }
            log.info("[AnalyticsCollection] Mốc {}h: {} bài cần thu thập", milestone, due.size());
            for (Post post : due) {
                collect(post, milestone);
            }
        }
    }

    private void collect(Post post, int milestone) {
        try {
            // HTTP trước, không transaction (rule #24) — token page/user lấy từ kết nối của lịch.
            MetaApiClient.MetaPostMetrics metrics = metaApiClient.getPostMetrics(
                    post.getPlatformName(),
                    post.getPlatformPostId(),
                    post.getSchedule().getPlatformAccount().getAccessToken());

            PostAnalytics analytics =
                    postAnalyticsMapper.toAnalytics(post, metrics, milestone, LocalDateTime.now());
            post.getPostAnalytics().add(analytics);

            // FR-55: Posted → Analyzing khi bắt đầu có số liệu (version + item).
            ContentVersion version = post.getSchedule().getContentVersion();
            if (version.getStatus() == ContentLifecycle.POSTED) {
                version.setStatus(ContentLifecycle.ANALYZING);
            }
            if (version.getContentItem().getStatus() == ContentLifecycle.POSTED) {
                version.getContentItem().setStatus(ContentLifecycle.ANALYZING);
            }

            postRepository.save(post); // cascade lưu bản ghi analytics
            log.info("[AnalyticsCollection] Đã thu mốc {}h cho bài {} ({})",
                    milestone, post.getId(), post.getPlatformName());
        } catch (Exception e) {
            log.warn("[AnalyticsCollection] Bỏ qua bài {} mốc {}h: {}", post.getId(), milestone, e.getMessage());
        }
    }
}
