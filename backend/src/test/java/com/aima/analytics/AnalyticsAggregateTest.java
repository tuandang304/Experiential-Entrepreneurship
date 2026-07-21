package com.aima.analytics;

import com.aima.dto.response.AnalyticsPlatformResponse;
import com.aima.dto.response.AnalyticsSummaryResponse;
import com.aima.dto.response.AnalyticsTimeseriesResponse;
import com.aima.entity.PlatformAccount;
import com.aima.entity.User;
import com.aima.enums.ConnectionStatus;
import com.aima.enums.Platform;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.AnalyticsMapper;
import com.aima.repository.BrandProfileRepository;
import com.aima.repository.PlatformAccountRepository;
import com.aima.repository.PostAnalyticsRepository;
import com.aima.repository.UserRepository;
import com.aima.repository.projection.DailyEngagementProjection;
import com.aima.repository.projection.PlatformMetricProjection;
import com.aima.repository.projection.TopPostProjection;
import com.aima.service.AnalyticsService;
import com.aima.service.Impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Logic gộp của trang Phân tích: zero-fill ngày trống, tổng theo kỳ, % so kỳ liền trước, quy kỳ
 * mặc định và chặn khoảng vô lý. Repository được mock nên test kiểm phần TÍNH TOÁN của service,
 * không phải SQL — chạy nhanh, không cần DB.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AnalyticsAggregateTest {

    static final String EMAIL = "u@a.com";
    static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock PostAnalyticsRepository postAnalyticsRepository;
    @Mock PlatformAccountRepository platformAccountRepository;
    @Mock BrandProfileRepository brandProfileRepository;
    @Mock UserRepository userRepository;
    @Mock AnalyticsMapper analyticsMapper;
    @Mock org.springframework.core.env.Environment environment;

    @InjectMocks AnalyticsServiceImpl service;

    @BeforeEach
    void stubUser() {
        User user = new User();
        user.setId(USER_ID);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    // ---------- helper ----------

    private DailyEngagementProjection row(String day, long views, long likes, long comments, long shares) {
        return new DailyEngagementProjection() {
            public String getDay() { return day; }
            public long getViews() { return views; }
            public long getLikes() { return likes; }
            public long getComments() { return comments; }
            public long getShares() { return shares; }
        };
    }

    private AnalyticsService.AnalyticsQuery range(String from, String to) {
        return new AnalyticsService.AnalyticsQuery(LocalDate.parse(from), LocalDate.parse(to), null);
    }

    // ---------- tổng + zero-fill + series ----------

    @Test
    void summary_tinhTongVaSeries7Ngay_zeroFillNgayTrong() {
        // Kỳ 01→07/06 (7 ngày); DB chỉ trả 2 ngày có bài. Kỳ so sánh trả rỗng.
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any()))
                .thenReturn(
                        List.of(row("2026-06-02", 100, 10, 2, 1),
                                row("2026-06-05", 50, 5, 1, 0)),
                        List.of());

        AnalyticsSummaryResponse summary = service.summary(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertEquals(7, summary.getRangeDays());
        assertEquals(150, summary.getViews().getTotal(), "tổng views = 100 + 50");
        assertEquals(15, summary.getLikes().getTotal());
        assertEquals(3, summary.getComments().getTotal());
        assertEquals(1, summary.getShares().getTotal());

        List<Long> viewsSeries = summary.getViews().getSeries();
        assertEquals(7, viewsSeries.size(), "đủ 7 điểm dù DB chỉ trả 2 ngày");
        assertEquals(0L, viewsSeries.get(0), "01/06 không có bài → 0");
        assertEquals(100L, viewsSeries.get(1), "02/06");
        assertEquals(50L, viewsSeries.get(4), "05/06");

        // Nhãn kỳ so sánh = 7 ngày liền trước.
        assertEquals("2026-05-25", summary.getCompareFrom());
        assertEquals("2026-05-31", summary.getCompareTo());
    }

    @Test
    void summary_deltaPctNull_khiKyTruocBangKhong() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any()))
                .thenReturn(List.of(row("2026-06-02", 100, 10, 2, 1)), List.of());

        AnalyticsSummaryResponse summary = service.summary(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertNull(summary.getViews().getDeltaPct(), "kỳ trước = 0 thì trả null, không phải +∞%");
    }

    @Test
    void summary_deltaPct_soSanhKyTruoc() {
        // Kỳ này views 150, kỳ trước views 100 → +50%.
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any()))
                .thenReturn(
                        List.of(row("2026-06-02", 100, 0, 0, 0), row("2026-06-05", 50, 0, 0, 0)),
                        List.of(row("2026-05-26", 100, 0, 0, 0)));

        AnalyticsSummaryResponse summary = service.summary(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertEquals(50.0, summary.getViews().getDeltaPct());
    }

    @Test
    void timeseries_zeroFillDuSoNgay() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any()))
                .thenReturn(List.of(row("2026-06-03", 80, 8, 2, 1)));

        AnalyticsTimeseriesResponse ts = service.timeseries(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertEquals(7, ts.getPoints().size());
        assertEquals("2026-06-01", ts.getPoints().get(0).getDate());
        assertEquals(0L, ts.getPoints().get(0).getViews());
        assertEquals(80L, ts.getPoints().get(2).getViews(), "03/06");
        assertEquals(8L, ts.getPoints().get(2).getLikes());
    }

    // ---------- quy kỳ mặc định + biên truy vấn ----------

    @Test
    void summary_khongTruyenNgay_macDinh7NgayGanNhat() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any())).thenReturn(List.of());

        AnalyticsSummaryResponse summary = service.summary(EMAIL,
                new AnalyticsService.AnalyticsQuery(null, null, null)).getResult();

        assertEquals(7, summary.getRangeDays());
        assertEquals(7, summary.getViews().getSeries().size());
    }

    @Test
    void fetch_mocKetThucExclusive_baoGomCaNgayCuoi() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any())).thenReturn(List.of());
        ArgumentCaptor<LocalDateTime> from = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> to = ArgumentCaptor.forClass(LocalDateTime.class);

        service.timeseries(EMAIL, range("2026-06-01", "2026-06-07"));

        verify(postAnalyticsRepository).findDailyEngagementForUser(eq(USER_ID), from.capture(), to.capture(), any());
        assertEquals(LocalDateTime.of(2026, 6, 1, 0, 0), from.getValue());
        assertEquals(LocalDateTime.of(2026, 6, 8, 0, 0), to.getValue(), "mốc kết thúc exclusive = đầu ngày 08 để 07 vẫn trong kỳ");
    }

    // ---------- lọc nền tảng ----------

    @Test
    void platformFilter_noiTenBangDauPhay() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), anyString())).thenReturn(List.of());
        ArgumentCaptor<String> csv = ArgumentCaptor.forClass(String.class);

        service.timeseries(EMAIL, new AnalyticsService.AnalyticsQuery(
                LocalDate.parse("2026-06-01"), LocalDate.parse("2026-06-07"),
                List.of(Platform.FACEBOOK, Platform.THREADS)));

        verify(postAnalyticsRepository).findDailyEngagementForUser(any(), any(), any(), csv.capture());
        assertEquals("FACEBOOK,THREADS", csv.getValue());
    }

    @Test
    void platformFilter_rong_truyenNull() {
        when(postAnalyticsRepository.findDailyEngagementForUser(any(), any(), any(), any())).thenReturn(List.of());
        ArgumentCaptor<String> csv = ArgumentCaptor.forClass(String.class);

        service.timeseries(EMAIL, range("2026-06-01", "2026-06-07"));

        verify(postAnalyticsRepository).findDailyEngagementForUser(any(), any(), any(), csv.capture());
        assertNull(csv.getValue(), "không lọc nền tảng → null để truy vấn bỏ điều kiện");
    }

    // ---------- chặn khoảng vô lý ----------

    @Test
    void resolve_tuNgaySauDenNgay_baoLoi() {
        AppException error = assertThrows(AppException.class,
                () -> service.summary(EMAIL, range("2026-06-10", "2026-06-01")));
        assertEquals(ErrorCode.ANALYTICS_RANGE_INVALID, error.getErrorCode());
    }

    @Test
    void resolve_khoangQuaDai_baoLoi() {
        AppException error = assertThrows(AppException.class,
                () -> service.summary(EMAIL, range("2020-01-01", "2026-01-01")));
        assertEquals(ErrorCode.ANALYTICS_RANGE_TOO_LARGE, error.getErrorCode());
    }

    // ---------- khối D — hiệu suất theo nền tảng ----------

    private PlatformMetricProjection platformRow(String platform, long views, long likes,
                                                 long comments, long shares, long engagement) {
        return new PlatformMetricProjection() {
            public String getPlatform() { return platform; }
            public long getViews() { return views; }
            public long getLikes() { return likes; }
            public long getComments() { return comments; }
            public long getShares() { return shares; }
            public long getEngagement() { return engagement; }
        };
    }

    private PlatformAccount account(Platform platform, ConnectionStatus status, String name) {
        PlatformAccount account = new PlatformAccount();
        account.setPlatformName(platform);
        account.setConnectionStatus(status);
        account.setAccountName(name);
        return account;
    }

    @Test
    void byPlatform_du3NenTang_tyTrongVaTrangThaiKetNoi() {
        when(postAnalyticsRepository.findPlatformMetricsForUser(any(), any(), any()))
                .thenReturn(List.of(
                        platformRow("FACEBOOK", 8000, 600, 150, 50, 800),
                        platformRow("THREADS", 2000, 150, 40, 10, 200)));
        when(platformAccountRepository.findByUser_IdAndDeletedAtIsNullOrderByCreatedAtDesc(USER_ID))
                .thenReturn(List.of(
                        account(Platform.FACEBOOK, ConnectionStatus.ACTIVE, "FB Page"),
                        account(Platform.THREADS, ConnectionStatus.EXPIRED, "Threads acc")));

        List<AnalyticsPlatformResponse> list = service.byPlatform(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertEquals(3, list.size(), "luôn đủ FB/IG/Threads");
        // Thứ tự theo Platform.values(): FACEBOOK, INSTAGRAM, THREADS.
        AnalyticsPlatformResponse fb = list.get(0);
        assertEquals(Platform.FACEBOOK, fb.getPlatform());
        assertTrue(fb.isConnected());
        assertEquals("FB Page", fb.getAccountName());
        assertEquals(80.0, fb.getSharePct(), "800 / 1000 tương tác");

        AnalyticsPlatformResponse ig = list.get(1);
        assertEquals(Platform.INSTAGRAM, ig.getPlatform());
        assertFalse(ig.isConnected(), "chưa kết nối → FE hiện CTA");
        assertNull(ig.getAccountName());
        assertEquals(0L, ig.getViews());
        assertEquals(0.0, ig.getSharePct());

        AnalyticsPlatformResponse threads = list.get(2);
        assertFalse(threads.isConnected(), "EXPIRED không phải ACTIVE");
        assertEquals(ConnectionStatus.EXPIRED, threads.getStatus());
        assertEquals(20.0, threads.getSharePct());
    }

    @Test
    void byPlatform_khongCoTuongTac_sharePct0_khongChiaCho0() {
        when(postAnalyticsRepository.findPlatformMetricsForUser(any(), any(), any())).thenReturn(List.of());
        when(platformAccountRepository.findByUser_IdAndDeletedAtIsNullOrderByCreatedAtDesc(USER_ID))
                .thenReturn(List.of());

        List<AnalyticsPlatformResponse> list = service.byPlatform(EMAIL, range("2026-06-01", "2026-06-07")).getResult();

        assertEquals(3, list.size());
        list.forEach(p -> {
            assertEquals(0.0, p.getSharePct());
            assertFalse(p.isConnected());
        });
    }

    // ---------- khối E — top bài viết ----------

    private TopPostProjection topRow(long views) {
        return new TopPostProjection() {
            public UUID getPostId() { return UUID.randomUUID(); }
            public UUID getContentItemId() { return null; }
            public String getPlatform() { return "FACEBOOK"; }
            public String getCaption() { return null; }
            public String getAccountName() { return null; }
            public LocalDateTime getPublishedAt() { return LocalDateTime.of(2026, 6, 3, 9, 0); }
            public long getViews() { return views; }
            public long getLikes() { return 0; }
            public long getComments() { return 0; }
            public long getShares() { return 0; }
            public long getEngagement() { return 0; }
        };
    }

    @SuppressWarnings("unchecked")
    @Test
    void topPosts_macDinhViewsGiamDan_vaKepLimit() {
        when(analyticsMapper.toTopPostResponseList(any())).thenReturn(List.of());
        when(postAnalyticsRepository.findTopPostsForUser(any(), any(), any(), any()))
                .thenReturn(List.of(topRow(10), topRow(30), topRow(20)));
        ArgumentCaptor<List<TopPostProjection>> captor = ArgumentCaptor.forClass(List.class);

        service.topPosts(EMAIL, range("2026-06-01", "2026-06-07"), null, 2);

        verify(analyticsMapper).toTopPostResponseList(captor.capture());
        List<TopPostProjection> passed = captor.getValue();
        assertEquals(2, passed.size(), "limit 2");
        assertEquals(30, passed.get(0).getViews(), "views giảm dần");
        assertEquals(20, passed.get(1).getViews());
    }

    @SuppressWarnings("unchecked")
    @Test
    void topPosts_sortTuyChon_tangDan() {
        when(analyticsMapper.toTopPostResponseList(any())).thenReturn(List.of());
        when(postAnalyticsRepository.findTopPostsForUser(any(), any(), any(), any()))
                .thenReturn(List.of(topRow(10), topRow(30), topRow(20)));
        ArgumentCaptor<List<TopPostProjection>> captor = ArgumentCaptor.forClass(List.class);

        service.topPosts(EMAIL, range("2026-06-01", "2026-06-07"), "views,asc", 10);

        verify(analyticsMapper).toTopPostResponseList(captor.capture());
        List<TopPostProjection> passed = captor.getValue();
        assertEquals(10, passed.get(0).getViews(), "views tăng dần");
        assertEquals(30, passed.get(2).getViews());
    }

    @SuppressWarnings("unchecked")
    @Test
    void topPosts_sortLa_roiVeMacDinh() {
        when(analyticsMapper.toTopPostResponseList(any())).thenReturn(List.of());
        when(postAnalyticsRepository.findTopPostsForUser(any(), any(), any(), any()))
                .thenReturn(List.of(topRow(10), topRow(30), topRow(20)));
        ArgumentCaptor<List<TopPostProjection>> captor = ArgumentCaptor.forClass(List.class);

        service.topPosts(EMAIL, range("2026-06-01", "2026-06-07"), "hacky_column;drop", 10);

        verify(analyticsMapper).toTopPostResponseList(captor.capture());
        assertEquals(30, captor.getValue().get(0).getViews(), "cột lạ → mặc định views giảm dần, không ném lỗi");
    }

    // ---------- dev seeder (cờ mặc định tắt) ----------

    @Test
    void devSeed_bicChanKhiCoTat() {
        AppException error = assertThrows(AppException.class, () -> service.devSeed(EMAIL));
        assertEquals(ErrorCode.ANALYTICS_SEED_DISABLED, error.getErrorCode(),
                "cờ mặc định false nên seeder phải từ chối");
    }

    @Test
    void devSeedClear_bicChanKhiCoTat() {
        AppException error = assertThrows(AppException.class, () -> service.devSeedClear(EMAIL));
        assertEquals(ErrorCode.ANALYTICS_SEED_DISABLED, error.getErrorCode());
    }
}
