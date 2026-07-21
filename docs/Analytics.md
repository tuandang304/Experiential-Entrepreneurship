# NHIỆM VỤ: Nâng cấp trang Analytics (tab "Phân tích") — Full-stack (FE + BE)

## 0. GIAI ĐOẠN KHẢO SÁT (BẮT BUỘC LÀM TRƯỚC, KHÔNG ĐƯỢC CODE NGAY)

Trước khi viết bất kỳ dòng code nào, hãy khảo sát repo và **báo cáo lại cho tôi** những mục sau:

### 0.1. Kiến trúc tổng thể
- Cấu trúc thư mục FE và BE, framework + version (Next.js App/Pages Router? NestJS/Express? ORM nào?)
- Cách tổ chức module/feature (feature-folder hay layer-based?)
- State management & data fetching đang dùng (React Query / SWR / Redux / fetch thuần?)
- UI library + design system: Tailwind config, theme tokens (màu tím/gradient chủ đạo của AIMA), component dùng chung (`Card`, `Button`, `Select`, `EmptyState`, `Skeleton`...), thư viện chart đã có (recharts? chart.js? nếu chưa có thì đề xuất, KHÔNG tự thêm dependency mới nếu chưa hỏi tôi)
- Cơ chế i18n (trang đang có toggle "Tiếng Việt") — mọi string mới PHẢI đi qua i18n, không hardcode

### 0.2. Trang Analytics hiện tại
- Đọc toàn bộ code trang `/analytics` hiện tại: component, hook, API call, kiểu dữ liệu
- Liệt kê rõ: hiện đang gọi API nào, trả về gì, vì sao mọi số đang là 0 (chưa có data thật? API chưa implement? chưa có job thu thập metrics?)

### 0.3. Các tab khác (để đồng bộ)
Khảo sát và mô tả pattern của: **Bảng điều khiển, Xu hướng, Quản lý nội dung, Lịch đăng bài, Bài lỗi & cần xử lý, Hồ sơ thương hiệu**
- Layout chuẩn của một page (header, sub-title, filter bar, spacing, card style, radius, shadow)
- Pattern loading / empty / error state
- Pattern phân trang, filter, date-range picker (nếu đã có component date-range thì TÁI SỬ DỤNG, không viết mới)
- Cách gọi API, cách handle error, cách hiển thị toast

### 0.4. Backend & dữ liệu
- Schema DB liên quan: posts, platforms/social_accounts, post_metrics/insights, campaigns, users, workspace/tenant
- Đã có bảng lưu metrics theo mốc thời gian (24h/48h/7d) chưa? Đã có job/cron/queue đồng bộ metrics từ Facebook/Instagram/TikTok/Threads/YouTube chưa?
- Convention BE: naming (camelCase/snake_case), cấu trúc `module/controller/service/repository/dto`, validation (class-validator/zod), response envelope chuẩn, error code, auth guard, phân quyền theo role (`System Administrator`, gói Pro...), multi-tenant scoping
- Convention migration, seed data

**➡️ Sau khi khảo sát, hãy trình bày: (a) tóm tắt hiện trạng, (b) gap analysis giữa ảnh 1 và ảnh 2, (c) kế hoạch triển khai chia theo từng PR/commit nhỏ. CHỜ TÔI DUYỆT rồi mới code.**

---

## 1. MỤC TIÊU GIAO DIỆN 

Trang Phân tích cần có các khối sau, theo đúng thứ tự, dùng đúng design token / component sẵn có của dự án:

**A. Header + Toolbar**
- Tiêu đề "Phân tích" + mô tả "Đo lường dữ liệu quan trọng để tối ưu hiệu suất nội dung"
- Thanh công cụ bên phải: **Date range picker** (mặc định 7 ngày qua, preset: Hôm nay / 7 ngày / 30 ngày / 90 ngày / Tùy chọn), **Bộ lọc** (nền tảng, loại nội dung, chiến dịch, tài khoản), **Xuất báo cáo** (CSV/XLSX + PDF)
- Toolbar phải sticky khi scroll, và **đồng bộ state lên URL query params** để share/refresh giữ nguyên bộ lọc

**B. 4 KPI card**: Lượt xem, Lượt thích, Bình luận, Chia sẻ
- Mỗi card: icon, số lớn (format rút gọn 12.4K khi hover hiện số đầy đủ), % thay đổi so với kỳ trước (xanh ↑ / đỏ ↓) kèm label khoảng thời gian so sánh, sparkline mini

**C. Biểu đồ "Bài đã đăng & số liệu tổng quan"** — line/area chart đa series (4 metric), có legend bật/tắt từng series, tooltip gộp, chọn khoảng thời gian riêng, trục X tự co giãn theo range

**D. "Hiệu suất theo nền tảng"** — donut chart + danh sách nền tảng (Instagram, Facebook, TikTok, Threads, YouTube) kèm số liệu và %. Chỉ hiển thị nền tảng người dùng đã kết nối; nền tảng chưa kết nối thì có CTA "Kết nối ngay"

**E. "Top bài viết hiệu quả"** — bảng: thumbnail, tiêu đề, ngày đăng, icon nền tảng, lượt xem/thích/bình luận/chia sẻ, **sort được theo từng cột**, click row → mở chi tiết bài viết, nút "Xem tất cả bài viết" điều hướng sang Quản lý nội dung với filter tương ứng

**F. "Hiệu suất theo loại nội dung"** — donut: Hình ảnh / Video / Reels / Văn bản

**G. "Thời điểm hoạt động nhiều nhất"** — heatmap 7 ngày × 24 giờ, tooltip hiển thị giá trị, thang màu Thấp → Cao

**H. "Thông tin chi tiết"** — Tổng bài đã đăng, Bài hoạt động tốt, Bài cần tối ưu, Khung giờ vàng, Tỷ lệ tương tác TB (kèm % thay đổi)

## 2. YÊU CẦU KỸ THUẬT FE
- Responsive: desktop 2 cột như ảnh 2 → tablet 1 cột → mobile card xếp dọc, chart scroll ngang
- **Skeleton loading** cho từng khối (không blocking cả trang), **empty state** riêng cho từng khối, **error state** có nút thử lại
- Giữ nguyên empty state hiện tại khi thực sự chưa có dữ liệu, nhưng viết lại rõ ràng + có CTA ("Tạo bài đăng đầu tiên")
- A11y: chart có `aria-label`, bảng dùng `<table>` đúng semantic, tương phản màu đạt WCAG AA
- Không hardcode dữ liệu mẫu vào component; nếu cần demo thì tách file mock có cờ `NEXT_PUBLIC_USE_MOCK`
- Memo hóa chart, tránh re-render toàn trang khi đổi filter một khối

## 3. YÊU CẦU BACKEND (bắt buộc tuân thủ convention repo)
- Tạo module `analytics` theo đúng cấu trúc/naming đang có trong repo (đọc một module hiện có làm khuôn mẫu, ví dụ module `posts`, rồi copy y hệt style)
- Endpoint gợi ý (điều chỉnh theo convention route hiện có):
    - `GET /analytics/summary` — 4 KPI + so sánh kỳ trước
    - `GET /analytics/timeseries` — dữ liệu chart theo ngày/giờ
    - `GET /analytics/by-platform`
    - `GET /analytics/by-content-type`
    - `GET /analytics/top-posts`
    - `GET /analytics/activity-heatmap`
    - `GET /analytics/insights`
    - `POST /analytics/export`
- Query params chuẩn: `from`, `to`, `platforms[]`, `contentTypes[]`, `campaignId`, `granularity`, `compare=previous_period`
- DTO + validation đầy đủ, response theo đúng envelope chuẩn của dự án, có OpenAPI/Swagger nếu repo đang dùng
- **Bảo mật**: mọi query phải scope theo `workspaceId`/`userId` từ token, không nhận từ client; áp dụng guard/role hiện có
- **Hiệu năng**: index DB cho `(workspace_id, published_at)`, `(post_id, collected_at)`; cân nhắc bảng aggregate `post_metrics_daily` + cache (Redis nếu có) TTL ngắn; tuyệt đối tránh N+1
- **Job thu thập metrics**: kiểm tra/bổ sung cron thu số liệu tại mốc 24h/48h/7d sau khi đăng (đúng như mô tả trong ảnh 1), có retry + log lỗi, ghi vào `Bài lỗi & cần xử lý` khi fail
- Múi giờ: xử lý theo timezone của workspace (VN mặc định `Asia/Ho_Chi_Minh`), không dùng UTC trực tiếp cho heatmap/khung giờ vàng
- Migration + seed data để test được ngay

## 4. QUY TẮC CHUNG
- **Không phá vỡ code hiện có**, không đổi API đang được tab khác dùng
- Tuân thủ tuyệt đối: naming convention, lint rule, prettier, folder structure, commit convention của repo
- Tách commit nhỏ, rõ ràng; mỗi commit build + lint + test pass
- Viết test cho service tính toán (so sánh kỳ trước, aggregate, timezone)
- Ghi chú lại các giả định vào file `docs/analytics.md`

## 5. ĐẦU RA MONG MUỐN
1. Báo cáo khảo sát + gap analysis + kế hoạch (chờ duyệt)
2. Code BE (module + migration + job + test)
3. Code FE (page + components + hooks + i18n)
4. Hướng dẫn chạy thử và seed dữ liệu demo

---
---

# 📌 TIẾN ĐỘ & BÀN GIAO (cập nhật 2026-07-21)

> Phần này tổng hợp toàn bộ khảo sát + việc đã làm + việc còn lại để **phiên sau không phải khảo sát lại**.
> Trạng thái: **Backend MVP xong (PR1–PR3). Frontend MVP xong (PR4–PR6) — `npm run build` (tsc) pass. Export chưa làm (PR7).**
> **CHƯA commit** — mọi thay đổi đang ở working tree, nhánh `main` (index còn file Dashboard staged sẵn của người khác, không đụng).

## A. 4 QUYẾT ĐỊNH ĐÃ CHỐT (không hỏi lại)
1. **Nền tảng:** CHỈ FB/IG/Threads trong mọi khối chart (bỏ TikTok/YouTube — ngoài scope dự án).
2. **Export:** CSV + XLSX + PDF đầy đủ → được duyệt thêm 2 dependency BE: **Apache POI (`poi-ooxml`)** + **OpenPDF** (tránh iText AGPL).
3. **Dữ liệu demo:** seeder dev-only gated sau cờ `aima.dev.analytics-seed-enabled` (đã làm ở PR3).
4. **Phạm vi đợt này = MVP khối A,B,C,D,E.** Hoãn **F** (donut loại nội dung), **G** (heatmap 7×24), **H** (insights) sang sau.

## B. KHẢO SÁT CÔ ĐỌNG (đủ để code tiếp, khỏi survey lại)

**Stack thật** (khác template trong đề bài):
- **FE:** React 18 + TS, **Vite 8**, React Router 6, **Zustand + Context**. Data-fetch = **axios thuần** (`src/api/apiClient.ts`, KHÔNG react-query). Chart = **recharts ^3.9**. i18n **tự chế** (`src/i18n.ts`, object `t.<key>` vi/en — không phải hàm). Date: không lib (slice chuỗi + `Intl`, `src/utils/format.ts`). Không có primitive `Button/Select/EmptyState/DateRange` dùng chung.
- **BE:** Java 21 + **Spring Boot 4.0.6**, JPA + PostgreSQL, MapStruct 1.5.5, springdoc 3.0.3. Layer-based `controller/service(+Impl)/repository(+projection)/dto/mapper/entity/enums`. Envelope `ApiResponse{code,message,result}`. Auth: `@AuthenticationPrincipal UserDetails principal` → `principal.getUsername()` = **email** → `findByEmail`. **Per-user, KHÔNG có workspace/tenant.** `@PreAuthorize` cho admin. `ddl-auto: update` (KHÔNG Flyway/Liquibase). Timezone env `APP_TIMEZONE` (Asia/Ho_Chi_Minh) áp cho JDBC + Jackson.

**Vì sao trang cũ toàn số 0:** pipeline thu số liệu ĐÃ chạy thật (không mock). 0 vì **chưa có dữ liệu**: `post_analytics` chỉ được `AnalyticsCollectionJob` (mỗi giờ) ghi cho bài `POSTED` đã qua mốc 24h; DB dev chưa có bài nào đủ điều kiện. Ngoài ra `saves/ctr/conversion/watch_time` luôn null (MVP), FB `views` cần quyền `read_insights`, IG không đăng được (MVP). **→ PR3 seeder giải quyết để demo.**

**Mô hình dữ liệu số liệu:** bảng `post_analytics` = time-series, mỗi bài tối đa 3 dòng (cột `milestone_hours` ∈ {24,48,168}), số **cộng dồn** → khi gộp phải lấy **1 snapshot/bài** bằng `DISTINCT ON (post_id) ... ORDER BY milestone_hours DESC`. Scope user qua chuỗi `posts → post_schedules → platform_accounts.user_id`; nội dung qua `content_items → brand_profiles.user_id`. Cascade: `BrandProfile.contentItems`, `ContentItem.contentVersions`, `ContentVersion.postSchedule`, `PostSchedule.post`, `Post.postAnalytics` đều `cascade ALL orphanRemoval` → lưu/xoá cả cây qua `BrandProfile`.

**File mẫu để bám (khuôn):** BE module **Dashboard** (`DashboardController`/`DashboardServiceImpl`/`DashboardMapper` + `repository/projection/*`); aggregate query mẫu `PostAnalyticsRepository.findDailyPerformanceForUser`; dev-seed mẫu `RevenueServiceImpl.devSeed/devSeedClear` + cờ `aima.dev.payment-seed-enabled`. FE: trang **Dashboard** (`pages/app/Dashboard.tsx` + `components/dashboard/*`), **Revenue** (`pages/admin/Revenue.tsx` + `components/admin/revenue/*`, chuẩn URL-sync + filter bar + export).

**Giả định đã áp (chốt):**
- Bỏ filter **"chiến dịch/campaign"** — model không có campaign.
- **Top bài KHÔNG có thumbnail** (media chỉ là prompt text — FR-29) → FE dùng icon nền tảng + caption.
- `views/ctr/saves...` có thể null → FE hiện "—"; IG luôn 0.
- **KHÔNG viết job thu metrics mới** — đã có `AnalyticsCollectionJob`.

## C. ĐÃ LÀM — BACKEND (PR1–PR3)

Toàn bộ endpoint mới nằm ở slice `GET/POST/DELETE /analytics/*` qua **`AnalyticsController`** (tách khỏi `PostAnalyticsController` cũ giữ `/analytics/posts`). Auth cookie sẵn, không cần sửa `SecurityConfig`. Tất cả bọc `ApiResponse<T>`.

**PR1 — Summary + Timeseries (khối B,C):**
- `GET /analytics/summary?from=&to=&platforms=` → `AnalyticsSummaryResponse` = `{ from, to, rangeDays, compareFrom, compareTo, views, likes, comments, shares }`, mỗi metric là `AnalyticsStatResponse{ total:long, deltaPct:Double|null, series:List<Long> }` (series = giá trị/ngày để vẽ sparkline). So sánh luôn theo kỳ liền trước cùng độ dài; `deltaPct=null` khi kỳ trước 0.
- `GET /analytics/timeseries?from=&to=&platforms=` → `AnalyticsTimeseriesResponse{ from, to, rangeDays, points:[{date, views, likes, comments, shares}] }` (đã zero-fill mọi ngày).

**PR2 — By-platform + Top-posts (khối D,E):**
- `GET /analytics/by-platform?from=&to=` → `List<AnalyticsPlatformResponse>` luôn đủ **3 nền tảng** = `{ platform, connected, accountName, avatarUrl, status, views, likes, comments, shares, engagement, sharePct }`. **Không** nhận `platforms` (donut là tỷ trọng giữa các nền tảng). `connected=false` → FE hiện CTA "Kết nối ngay".
- `GET /analytics/top-posts?from=&to=&platforms=&sort=&limit=` → `List<AnalyticsTopPostResponse>` = `{ postId, contentItemId, platform, caption, accountName, publishedAt, views, likes, comments, shares, engagement }`. `sort` ∈ `views|likes|comments|shares|engagement|date` + `,asc|,desc` (mặc định `views,desc`, cột lạ rơi về mặc định — whitelist, không nhận ORDER BY tuỳ ý). `limit` mặc định 10, kẹp [1,50].

**PR3 — Seeder dev-only:**
- `POST /analytics/dev-seed` (seed) và `DELETE /analytics/dev-seed` (clear) — seed cho **user hiện tại**. Tạo 1 hồ sơ MẪU `"[DEV-SEED] Phân tích demo"` + 3 kết nối MẪU ACTIVE (FB/IG/Threads, `platform_account_id` prefix `devseed-`, token giả vẫn mã hoá AES) + 30 bài rải 60 ngày kèm snapshot 24h/48h/7d (số liệu tăng dần theo mốc, deterministic `Random(20260721L)`). **Idempotent** (dọn dữ liệu mẫu cũ trước). Gated 3 lớp: cờ `aima.dev.analytics-seed-enabled` (mặc định false) + `AIMA_PRODUCTION_MODE` + profile prod → mã lỗi **2052 `ANALYTICS_SEED_DISABLED`**. `isActive=false` để không đụng hồ sơ thật.

**File BE đã tạo/sửa:**
- Controller: `controller/AnalyticsController.java` (mới)
- Service: `service/AnalyticsService.java` (mới, +record `AnalyticsQuery(from,to,platforms)`), `service/Impl/AnalyticsServiceImpl.java` (mới)
- DTO: `dto/response/Analytics{Summary,Stat,Timeseries,Point,Platform,TopPost}Response.java` (6 mới)
- Mapper: `mapper/AnalyticsMapper.java` (mới, projection→top-post DTO)
- Repo: `repository/PostAnalyticsRepository.java` (+3 query native: `findDailyEngagementForUser`, `findPlatformMetricsForUser`, `findTopPostsForUser`); `repository/BrandProfileRepository.java` (+`findByUser_IdAndBrandName`)
- Projection: `repository/projection/{DailyEngagement,PlatformMetric,TopPost}Projection.java` (3 mới)
- ErrorCode: +`ANALYTICS_RANGE_INVALID(2050)`, `ANALYTICS_RANGE_TOO_LARGE(2051)`, `ANALYTICS_SEED_DISABLED(2052)`
- Config: `application.yml` (+cờ `aima.dev.analytics-seed-enabled`)
- Test: `test/java/com/aima/analytics/AnalyticsAggregateTest.java` — **17/17 PASS** (zero-fill, deltaPct null/tính, mốc exclusive, CSV nền tảng, sort/limit, sharePct/connected, guard seeder tắt).

## D. ĐÃ LÀM — FRONTEND (PR4–PR6)

Trang `Analytics.tsx` dựng lại hoàn toàn theo bố cục A→B→(C|D)→E; build `npm run build` (tsc + vite) **pass**. Không thêm dependency FE (recharts đã có). Mọi string qua i18n (vi+en). Chỉ FB/IG/Threads.

**PR4 — Toolbar + KPI (khối A,B):**
- `api/analytics.ts` (+types & hàm): `AnalyticsStat/Summary/Point/Timeseries/Platform/TopPost` + `getAnalyticsSummary/Timeseries/ByPlatform/TopPosts` (platforms→CSV cho Spring `List<Platform>`), `devSeedAnalytics()/devSeedAnalyticsClear()` (trả `data.result`).
- `pages/app/Analytics.tsx`: giữ `<PageContainer>` (title/subtitle vẫn ở Topbar `PAGE_KEYS.analytics`); state nguồn-sự-thật = **URL query** (`from/to/platforms/sortField/sortDir`) qua `useSearchParams` + `patchParams` (khuôn `Revenue.tsx`). Khối lõi (B+C+D) và khối E tải tách nhau (`coreLoad`/`topLoad`). **Skeleton shimmer** (class `.sk`, đồng bộ `DashboardSkeleton`): lần tải ĐẦU (`booted=false`) skeleton CẢ trang kể cả thanh lọc (`AnalyticsSkeleton withToolbar` + `TopPostsSkeleton`) cho khỏi "dở dang"; các lần đổi filter sau giữ thanh lọc thật, chỉ skeleton phần nội dung. Không còn error-state riêng — lỗi/rỗng rơi về dữ liệu mẫu (xem mục dưới).
- `components/analytics/AnalyticsToolbar.tsx`: preset **Hôm nay/7/30/90/Tùy chọn** (ghép 2× `components/DatePicker`, `activePreset()` suy preset từ from/to) + chip nền tảng multi-select; đặt trong `<Card sticky top:0>`.
- 4 KPI: **tái dùng `components/dashboard/StatCard`** (shape `AnalyticsStat` ≡ `DashboardStat`), tone từ `analyticsTokens.METRIC_TONE`, `comparisonLabel = t.anaVsPrev`; grid 4/2/1 theo `useBreakpoint`.

**PR5 — Charts (khối C,D):**
- `components/analytics/AnalyticsTrendChart.tsx`: recharts `AreaChart` 4 series (gradient/series, `isAnimationActive={false}`, tooltip dạng hàm gộp), legend **bấm bật/tắt** từng series (chặn tắt series cuối), màu `analyticsTokens.METRIC_COLOR` (khớp stroke của StatCard), nối `/timeseries` (đã zero-fill).
- `components/analytics/PlatformBreakdown.tsx`: donut `PieChart` tỷ trọng tương tác + list đủ 3 nền tảng (`sharePct`); `connected=false` → nút **"Kết nối ngay"** `go('settings')`. Nối `/by-platform` (không áp filter platforms).
- `components/analytics/analyticsTokens.ts`: màu 4 metric + tone + màu donut nền tảng + GRID/AXIS.

**PR6 — Top posts (khối E):**
- Bảng tách presentational `components/analytics/PostsTable.tsx` (`<table>` semantic, **sort theo cột** đổi `sortField/sortDir` → gọi lại API, không sort client; `PlatformTag` + caption, không thumbnail) — dùng chung cho bảng chính + modal.
- `TopPostsTable.tsx`: Card + tiêu đề + `PostsTable` **5 bài đầu** (`PREVIEW_COUNT`), **dưới bảng** là nút "Xem tất cả bài viết" (căn giữa) → mở modal. Row click → `go('create')`.
- `AllPostsModal.tsx`: `components/Modal` shell, `PostsTable` + **phân trang client-side** 8 bài/trang (endpoint top-posts không phân trang server-side, trang lấy tối đa `limit=50` một mẻ). Đổi sort → về trang 1.
- i18n: thêm block key mới (`anaRange*`, `anaVsPrev`, `anaTrend*`, `anaByPlatform*`, `anaEngagement`, `anaConnect`, `anaTop*`, `anaViewAll`) vào **cả `vi` và `en`**.

**Giả định FE đã áp (khác kế hoạch gốc, chốt):**
- **Click row / "Xem tất cả" → `go('create')`** (danh sách nội dung). Chưa có route chi tiết bài theo id nên chưa deep-link theo `contentItemId`/filter — bổ sung khi có route.
- KPI dùng thẳng `StatCard` của Dashboard (không viết StatCard riêng) vì shape trùng khớp.
- Loading/empty/error theo khuôn `Revenue.tsx` (core loader + block loader) thay cho `StatePanel` riêng từng khối — cùng trải nghiệm với trang admin đã duyệt.
- Bảng Top giới hạn 10 dòng (limit backend); xem thêm qua "Xem tất cả".

**File FE đã tạo/sửa:** `pages/app/Analytics.tsx` (rewrite, kèm fallback dữ liệu mẫu + banner demo + skeleton lần đầu + modal Xem tất cả); `api/analytics.ts` (+types & hàm tổng hợp); `api/analyticsMock.ts` (mới — builder demo tất định, 20 caption); `components/analytics/{AnalyticsToolbar,AnalyticsTrendChart,PlatformBreakdown,PostsTable,TopPostsTable,AllPostsModal,AnalyticsSkeleton,analyticsTokens}.tsx|ts` (8 mới); `i18n.ts` (+key vi/en, +`anaDemoNote/anaAllPostsTitle/anaTotalPosts/anaPrevPage/anaNextPage`); `vite-env.d.ts` + `.env.example` (cờ `VITE_USE_MOCK`).

## D2. CÒN LẠI — CHƯA LÀM

**PR7 — Export (khối A):**
- Thêm 2 dependency vào `backend/pom.xml`: `org.apache.poi:poi-ooxml` + OpenPDF (`com.github.librepdf:openpdf`).
- BE `POST /analytics/export?format=csv|xlsx|pdf` (+ bộ lọc from/to/platforms/sort) sinh file (base64/bytes trong `result`, hoặc trả stream); tham khảo `RevenueServiceImpl.export` (CSV) + `CsvUtil`. Nút Export trên toolbar FE.

**Ngoài MVP (đợt sau, đã hoãn):** khối **F** (donut Ảnh/Video/Reels/Văn bản — map từ `content_versions.media_format`), **G** (heatmap 7×24 theo giờ VN), **H** ("Thông tin chi tiết": tổng bài/top/cần tối ưu/khung giờ vàng tái dùng FR-48/tỷ lệ tương tác TB).

## E. CÁCH CHẠY & VERIFY (không boot app live-publishing)
- **JDK 21 bắt buộc:** `JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot`.
- **Chạy test analytics:** `mvnw.cmd -f backend/pom.xml -q test -Dtest=AnalyticsAggregateTest -Dsurefire.failIfNoSpecifiedTests=false` → xem `backend/target/surefire-reports/com.aima.analytics.AnalyticsAggregateTest.txt`.
- **Dùng seeder để có dữ liệu demo (số liệu THẬT trong DB):** đặt `AIMA_DEV_ANALYTICS_SEED=true` trong `backend/.env` → gọi `POST {CONTEXT_PATH}/analytics/dev-seed` (đăng nhập bằng tài khoản test) → trang Phân tích có data. `DELETE .../analytics/dev-seed` để dọn. **⚠️ `.env` đang trỏ Postgres Supabase từ xa + scheduler đăng bài thật mỗi 60s → cân nhắc trước khi boot app; ưu tiên verify bằng test/JDBC.**
- **DỮ LIỆU MẪU FE (tự động — cho môi trường đã deploy chưa có số liệu):** trang `Analytics.tsx` TỰ fallback dữ liệu mẫu tất định (`frontend/src/api/analyticsMock.ts`) khi `summaryHasData` sai (toàn 0) **hoặc** API lỗi (backend chưa deploy endpoint `/analytics/summary|timeseries|by-platform|top-posts`) — kèm banner + badge "Dữ liệu mẫu" (`t.dbDemoData`/`anaDemoNote`); có số liệu thật thì luôn ưu tiên thật, badge tự tắt. Không cần cấu hình gì → chỉ redeploy FE. Tôn trọng bộ lọc (khoảng ngày/nền tảng/sort), FB+IG có số liệu, Threads để "chưa kết nối" minh hoạ CTA. Đặt `VITE_USE_MOCK=true` để **ÉP** mock kể cả khi có số liệu thật (chụp ảnh giao diện đầy đủ). ⚠️ Chỉ mock **slice /analytics**; trang vẫn sau `ProtectedRoute` nên vẫn cần **đăng nhập** (auth vẫn gọi backend).
- **Commit:** chưa thực hiện theo yêu cầu; khi commit nên tách theo PR và tạo nhánh feature (đang ở `main`).