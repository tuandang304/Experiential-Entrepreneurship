package com.aima.service.Impl;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.DashboardDistributionResponse;
import com.aima.dto.response.DashboardOnboardingResponse;
import com.aima.dto.response.DashboardPlatformResponse;
import com.aima.dto.response.DashboardPointResponse;
import com.aima.dto.response.DashboardStatResponse;
import com.aima.dto.response.DashboardStatsResponse;
import com.aima.dto.response.DashboardSummaryResponse;
import com.aima.dto.response.DashboardTopicResponse;
import com.aima.entity.PlatformAccount;
import com.aima.entity.User;
import com.aima.enums.ConnectionStatus;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.DashboardMapper;
import com.aima.repository.BrandProfileRepository;
import com.aima.repository.ContentItemRepository;
import com.aima.repository.ContentStrategyRepository;
import com.aima.repository.ContentVersionRepository;
import com.aima.repository.PlatformAccountRepository;
import com.aima.repository.PostAnalyticsRepository;
import com.aima.repository.UserRepository;
import com.aima.repository.projection.DailyMetricProjection;
import com.aima.repository.projection.DailyStatusCountProjection;
import com.aima.repository.projection.LabelCountProjection;
import com.aima.repository.projection.StatusCountProjection;
import com.aima.service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * UI-02 — dữ liệu tab "Bảng điều khiển" trong MỘT endpoint tổng hợp thay cho 7 lần gọi rời rạc.
 *
 * <p>Toàn bộ số liệu được tính bằng truy vấn gộp (COUNT/GROUP BY) chứ không nạp entity rồi đếm
 * trong bộ nhớ — 9 truy vấn cố định, không phụ thuộc số bài của user (không N+1). Mọi truy vấn
 * đều lọc theo user đang đăng nhập (API-03/SEC-04).
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    // Sparkline dài 7 ngày và "% thay đổi" so 7 ngày qua với 7 ngày liền trước — hai kỳ liền nhau
    // nên MỘT truy vấn 14 ngày phục vụ được cả hai.
    static int TREND_DAYS = 7;
    // Biểu đồ hiệu suất chỉ nhận 7 hoặc 30 ngày (hợp đồng API); giá trị lạ được kẹp về [7, 30].
    static int MIN_RANGE_DAYS = 7;
    static int MAX_RANGE_DAYS = 30;
    static int TOP_TOPICS_LIMIT = 5;
    static int ONBOARDING_STEPS = 4;

    /** Nhãn gộp cho bản nền tảng chưa có định dạng media (mediaFormat null). */
    static String OTHER_LABEL = "OTHER";

    // Gom trạng thái vòng đời (docs/WORKFLOWS.md) thành 4 thẻ số liệu.
    static Set<ContentLifecycle> POSTED_STATUSES =
            EnumSet.of(ContentLifecycle.POSTED, ContentLifecycle.ANALYZING, ContentLifecycle.OPTIMIZED);
    // POSTING (đang đẩy lên nền tảng) tính vào "đang chờ": chưa đăng xong nên không thể là "đã đăng",
    // cũng chưa lỗi nên không phải "bị từ chối" — bỏ ra ngoài thì bài biến mất khỏi cả 3 thẻ.
    static Set<ContentLifecycle> PENDING_STATUSES = EnumSet.of(
            ContentLifecycle.NEED_REVIEW, ContentLifecycle.APPROVED,
            ContentLifecycle.SCHEDULED, ContentLifecycle.POSTING);
    static Set<ContentLifecycle> REJECTED_STATUSES = EnumSet.of(ContentLifecycle.FAILED);
    static Set<ContentLifecycle> ALL_STATUSES = EnumSet.allOf(ContentLifecycle.class);

    ContentItemRepository contentItemRepository;
    ContentVersionRepository contentVersionRepository;
    PostAnalyticsRepository postAnalyticsRepository;
    PlatformAccountRepository platformAccountRepository;
    BrandProfileRepository brandProfileRepository;
    ContentStrategyRepository contentStrategyRepository;
    UserRepository userRepository;
    DashboardMapper dashboardMapper;

    @Override
    public ApiResponse<DashboardSummaryResponse> getSummary(String email, int days) {
        UUID userId = currentUser(email).getId();
        int rangeDays = Math.min(Math.max(days, MIN_RANGE_DAYS), MAX_RANGE_DAYS);
        LocalDate today = LocalDate.now();

        Map<ContentLifecycle, Long> totals = loadStatusTotals(userId);
        DashboardStatsResponse stats = buildStats(userId, today, totals);
        List<DashboardTopicResponse> topTopics = dashboardMapper.toTopicResponseList(
                postAnalyticsRepository.findTopTopicsForUser(userId, TOP_TOPICS_LIMIT));
        // Một lần nạp kết nối dùng cho cả panel nền tảng lẫn bước "kết nối" của tiến độ thiết lập.
        List<PlatformAccount> accounts =
                platformAccountRepository.findByUser_IdAndDeletedAtIsNullOrderByCreatedAtDesc(userId);

        DashboardSummaryResponse summary = DashboardSummaryResponse.builder()
                .stats(stats)
                .awaitingReview(totals.getOrDefault(ContentLifecycle.NEED_REVIEW, 0L))
                .scheduled(totals.getOrDefault(ContentLifecycle.SCHEDULED, 0L))
                .performance(buildPerformance(userId, today, rangeDays))
                .rangeDays(rangeDays)
                .contentTypes(buildContentTypes(userId))
                .topTopics(topTopics)
                .platforms(buildPlatforms(accounts))
                .onboarding(buildOnboarding(userId, accounts, stats.getTotal().getTotal()))
                .build();
        return ApiResponse.success("Lấy dữ liệu bảng điều khiển thành công", summary);
    }

    // ===== Thẻ số liệu =====

    private Map<ContentLifecycle, Long> loadStatusTotals(UUID userId) {
        Map<ContentLifecycle, Long> totals = new EnumMap<>(ContentLifecycle.class);
        for (StatusCountProjection row : contentItemRepository.countByStatusForUser(userId)) {
            if (row.getStatus() != null) {
                totals.merge(row.getStatus(), row.getTotal(), Long::sum);
            }
        }
        return totals;
    }

    private DashboardStatsResponse buildStats(UUID userId, LocalDate today, Map<ContentLifecycle, Long> totals) {
        LocalDate seriesStart = today.minusDays(TREND_DAYS - 1L);
        LocalDate previousStart = today.minusDays(2L * TREND_DAYS - 1);
        Map<ContentLifecycle, Map<LocalDate, Long>> daily = loadDailyCounts(userId, previousStart);

        return DashboardStatsResponse.builder()
                .total(buildStat(totals, daily, ALL_STATUSES, seriesStart, previousStart))
                .posted(buildStat(totals, daily, POSTED_STATUSES, seriesStart, previousStart))
                .pending(buildStat(totals, daily, PENDING_STATUSES, seriesStart, previousStart))
                .rejected(buildStat(totals, daily, REJECTED_STATUSES, seriesStart, previousStart))
                .build();
    }

    private Map<ContentLifecycle, Map<LocalDate, Long>> loadDailyCounts(UUID userId, LocalDate from) {
        Map<ContentLifecycle, Map<LocalDate, Long>> daily = new EnumMap<>(ContentLifecycle.class);
        for (DailyStatusCountProjection row : contentItemRepository.countDailyByStatusForUser(userId, from.atStartOfDay())) {
            ContentLifecycle status = parseStatus(row.getStatus());
            if (status == null) {
                continue;
            }
            daily.computeIfAbsent(status, s -> new HashMap<>())
                    .merge(LocalDate.parse(row.getDay()), row.getTotal(), Long::sum);
        }
        return daily;
    }

    // Cột status do chính hệ thống ghi nên luôn hợp lệ; giá trị lạ (dữ liệu cũ) chỉ bỏ qua để một
    // bản ghi hỏng không làm sập cả bảng điều khiển.
    private ContentLifecycle parseStatus(String value) {
        try {
            return ContentLifecycle.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            log.warn("Bỏ qua trạng thái nội dung không hợp lệ khi tổng hợp bảng điều khiển: {}", value);
            return null;
        }
    }

    private DashboardStatResponse buildStat(Map<ContentLifecycle, Long> totals,
                                            Map<ContentLifecycle, Map<LocalDate, Long>> daily,
                                            Set<ContentLifecycle> bucket,
                                            LocalDate seriesStart,
                                            LocalDate previousStart) {
        long total = bucket.stream().mapToLong(status -> totals.getOrDefault(status, 0L)).sum();

        List<Long> series = new ArrayList<>(TREND_DAYS);
        long current = 0;
        long previous = 0;
        for (int i = 0; i < TREND_DAYS; i++) {
            long value = countOn(daily, bucket, seriesStart.plusDays(i));
            series.add(value);
            current += value;
            previous += countOn(daily, bucket, previousStart.plusDays(i));
        }

        return DashboardStatResponse.builder()
                .total(total)
                .deltaPct(deltaPct(current, previous))
                .series(series)
                .build();
    }

    private long countOn(Map<ContentLifecycle, Map<LocalDate, Long>> daily,
                         Set<ContentLifecycle> bucket,
                         LocalDate day) {
        long sum = 0;
        for (ContentLifecycle status : bucket) {
            Map<LocalDate, Long> perDay = daily.get(status);
            if (perDay != null) {
                sum += perDay.getOrDefault(day, 0L);
            }
        }
        return sum;
    }

    // null khi kỳ trước bằng 0 (không có mốc để so) — FE hiển thị "—" thay vì vô cực,
    // cùng quy ước với các thẻ số liệu của trang Doanh thu.
    private Double deltaPct(long current, long previous) {
        if (previous == 0) {
            return null;
        }
        double pct = ((double) (current - previous) / previous) * 100;
        return Math.round(pct * 10) / 10.0;
    }

    // ===== Biểu đồ hiệu suất =====

    private List<DashboardPointResponse> buildPerformance(UUID userId, LocalDate today, int rangeDays) {
        LocalDate start = today.minusDays(rangeDays - 1L);
        Map<String, DailyMetricProjection> byDay = postAnalyticsRepository
                .findDailyPerformanceForUser(userId, start.atStartOfDay())
                .stream()
                .collect(Collectors.toMap(DailyMetricProjection::getDay, row -> row, (first, second) -> first));

        // Zero-fill: ngày không có bài đăng vẫn phải có điểm, nếu không đường biểu đồ sẽ đứt quãng.
        List<DashboardPointResponse> points = new ArrayList<>(rangeDays);
        for (int i = 0; i < rangeDays; i++) {
            String day = start.plusDays(i).toString();
            DailyMetricProjection row = byDay.get(day);
            points.add(DashboardPointResponse.builder()
                    .date(day)
                    .reach(row == null ? 0 : row.getReach())
                    .engagement(row == null ? 0 : row.getEngagement())
                    .build());
        }
        return points;
    }

    // ===== Donut loại nội dung =====

    private List<DashboardDistributionResponse> buildContentTypes(UUID userId) {
        List<LabelCountProjection> rows = contentVersionRepository.countByMediaFormatForUser(userId);
        long total = rows.stream().mapToLong(LabelCountProjection::getTotal).sum();
        if (total == 0) {
            return List.of();
        }

        Map<String, Long> merged = new LinkedHashMap<>();
        for (LabelCountProjection row : rows) {
            String label = (row.getLabel() == null || row.getLabel().isBlank()) ? OTHER_LABEL : row.getLabel();
            merged.merge(label, row.getTotal(), Long::sum);
        }

        return merged.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> DashboardDistributionResponse.builder()
                        .label(entry.getKey())
                        .value(entry.getValue())
                        .sharePct(Math.round(entry.getValue() * 1000.0 / total) / 10.0)
                        .build())
                .toList();
    }

    // ===== Nền tảng đã kết nối =====

    private List<DashboardPlatformResponse> buildPlatforms(List<PlatformAccount> accounts) {
        return Arrays.stream(Platform.values())
                .map(platform -> pickAccount(accounts, platform)
                        .map(account -> dashboardMapper.toPlatformResponse(
                                account, account.getConnectionStatus() == ConnectionStatus.ACTIVE))
                        .orElseGet(() -> dashboardMapper.toDisconnectedPlatformResponse(platform)))
                .toList();
    }

    // Một nền tảng có thể có nhiều bản ghi (Facebook: tài khoản gốc + từng Page). Ưu tiên bản ACTIVE,
    // trong đó ưu tiên kết nối gốc vì tên hiển thị dễ nhận ra hơn.
    private Optional<PlatformAccount> pickAccount(List<PlatformAccount> accounts, Platform platform) {
        return accounts.stream()
                .filter(account -> account.getPlatformName() == platform)
                .min(Comparator
                        .comparing((PlatformAccount account) -> account.getConnectionStatus() != ConnectionStatus.ACTIVE)
                        .thenComparing(account -> account.getParentConnection() != null));
    }

    // ===== Tiến độ thiết lập (FR-86) =====

    private DashboardOnboardingResponse buildOnboarding(UUID userId, List<PlatformAccount> accounts, long contentTotal) {
        boolean brand = brandProfileRepository.countByUser_IdAndDeletedAtIsNull(userId) > 0;
        boolean connection = accounts.stream()
                .anyMatch(account -> account.getConnectionStatus() == ConnectionStatus.ACTIVE);
        boolean strategy = contentStrategyRepository.countByBrandProfile_User_IdAndDeletedAtIsNull(userId) > 0;
        boolean content = contentTotal > 0;

        int completed = (brand ? 1 : 0) + (connection ? 1 : 0) + (strategy ? 1 : 0) + (content ? 1 : 0);
        return DashboardOnboardingResponse.builder()
                .brand(brand)
                .connection(connection)
                .strategy(strategy)
                .content(content)
                .completed(completed)
                .total(ONBOARDING_STEPS)
                .build();
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
