package com.aima.controller;

import com.aima.dto.response.AnalyticsPlatformResponse;
import com.aima.dto.response.AnalyticsSummaryResponse;
import com.aima.dto.response.AnalyticsTimeseriesResponse;
import com.aima.dto.response.AnalyticsTopPostResponse;
import com.aima.dto.response.ApiResponse;
import com.aima.enums.Platform;
import com.aima.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Trang Phân tích (UI-08) — số liệu GỘP theo kỳ/ngày. Khác {@link PostAnalyticsController}
 * ({@code /analytics/posts} — danh sách từng bài) dù cùng gốc {@code /analytics}: đường dẫn con
 * khác nhau nên không đụng nhau.
 *
 * <p>Bộ lọc thời gian dùng chung: {@code from}/{@code to} (yyyy-MM-dd, mặc định 7 ngày gần nhất) +
 * {@code platforms} (rỗng = mọi nền tảng). Service validate và quy ra khoảng thật; khoảng ngược →
 * mã 2050, quá dài → 2051. So sánh luôn theo kỳ liền trước cùng độ dài.
 */
@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Analytics", description = "Số liệu tổng hợp trang Phân tích (UI-08): KPI + chuỗi theo ngày.")
public class AnalyticsController {

    AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "4 thẻ KPI (views/likes/comments/shares) kèm % so với kỳ liền trước và sparkline (khối B)",
            description = "from/to định dạng yyyy-MM-dd, mặc định 7 ngày gần nhất; platforms lọc theo nền tảng "
                    + "(FACEBOOK/INSTAGRAM/THREADS), bỏ trống = tất cả. Kỳ so sánh = kỳ liền trước cùng độ dài; "
                    + "deltaPct = null khi kỳ trước bằng 0.")
    public ApiResponse<AnalyticsSummaryResponse> summary(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) List<Platform> platforms) {
        return analyticsService.summary(principal.getUsername(),
                new AnalyticsService.AnalyticsQuery(from, to, platforms));
    }

    @GetMapping("/timeseries")
    @Operation(summary = "Chuỗi 4 metric theo ngày cho biểu đồ đa series, đã zero-fill (khối C)",
            description = "Cùng bộ lọc from/to/platforms như /summary. Trả đủ rangeDays điểm — ngày không có "
                    + "bài đăng có giá trị 0 để trục X co giãn theo range mà đường không gãy.")
    public ApiResponse<AnalyticsTimeseriesResponse> timeseries(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) List<Platform> platforms) {
        return analyticsService.timeseries(principal.getUsername(),
                new AnalyticsService.AnalyticsQuery(from, to, platforms));
    }

    @GetMapping("/by-platform")
    @Operation(summary = "Hiệu suất theo nền tảng cho donut + danh sách (khối D)",
            description = "Luôn trả đủ 3 nền tảng FACEBOOK/INSTAGRAM/THREADS kèm số liệu, tỷ trọng tương tác "
                    + "và trạng thái kết nối (connected=false → FE hiển thị CTA 'Kết nối ngay'). KHÔNG áp bộ lọc "
                    + "platforms vì donut thể hiện tỷ trọng giữa các nền tảng; chỉ dùng from/to.")
    public ApiResponse<List<AnalyticsPlatformResponse>> byPlatform(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.byPlatform(principal.getUsername(),
                new AnalyticsService.AnalyticsQuery(from, to, null));
    }

    @GetMapping("/top-posts")
    @Operation(summary = "Bảng 'Top bài viết hiệu quả' — sắp xếp theo cột, giới hạn số dòng (khối E)",
            description = "Cùng bộ lọc from/to/platforms. sort = views|likes|comments|shares|engagement|date "
                    + "[,asc|,desc] (mặc định views,desc); limit kẹp về [1, 50]. MVP không có thumbnail — FE dùng "
                    + "icon nền tảng + caption; contentItemId để mở chi tiết / lọc Quản lý nội dung.")
    public ApiResponse<List<AnalyticsTopPostResponse>> topPosts(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) List<Platform> platforms,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "10") int limit) {
        return analyticsService.topPosts(principal.getUsername(),
                new AnalyticsService.AnalyticsQuery(from, to, platforms), sort, limit);
    }

    @PostMapping("/dev-seed")
    @Operation(summary = "DEV-ONLY: sinh số liệu Phân tích MẪU cho user hiện tại (dựng/demo giao diện)",
            description = "Bật bằng cờ aima.dev.analytics-seed-enabled (mặc định tắt — mã 2052). Tạo hồ sơ + "
                    + "3 kết nối MẪU + bài đã đăng rải 60 ngày kèm snapshot 24h/48h/7d. Idempotent (dọn dữ liệu "
                    + "mẫu cũ trước). PHẢI tắt/gỡ khi có bài đăng thật.")
    public ApiResponse<Integer> devSeed(@AuthenticationPrincipal UserDetails principal) {
        return analyticsService.devSeed(principal.getUsername());
    }

    @DeleteMapping("/dev-seed")
    @Operation(summary = "DEV-ONLY: xoá sạch số liệu Phân tích mẫu đã sinh (chạy lại seed được)")
    public ApiResponse<Integer> devSeedClear(@AuthenticationPrincipal UserDetails principal) {
        return analyticsService.devSeedClear(principal.getUsername());
    }
}
