import client, { type ApiResponse, type PageResponse } from "./apiClient";
import type { Platform } from "./brandProfile";
import type { ConnectionStatus } from "./connections";

// Số liệu bài đã đăng (FR-59..FR-62) — backend PostAnalyticsController (/analytics).
// Mỗi bài kèm snapshot các mốc 24h/48h/7 ngày; CTR/conversion/watch time = null trong MVP.

export interface AnalyticsSnapshot {
  id: string;
  /** 24, 48 hoặc 168 (7 ngày). */
  milestoneHours: number;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  ctr: number | null;
  conversion: number | null;
  watchTime: number | null;
  collectedAt: string;
}

export interface AnalyzedPost {
  id: string;
  platformName: Platform;
  platformPostId: string | null;
  accountName: string | null;
  contentItemId: string | null;
  formattedCaption: string | null;
  publishedAt: string;
  /** Sắp theo mốc tăng dần (24h → 48h → 7d). */
  analytics: AnalyticsSnapshot[];
}

// GET /analytics/posts — bài POSTED mới nhất trước, phân trang server-side.
export async function listAnalyzedPosts(params: { page?: number; size?: number } = {}): Promise<PageResponse<AnalyzedPost>> {
  const { data } = await client.get<ApiResponse<PageResponse<AnalyzedPost>>>("/analytics/posts", { params });
  return data.result;
}

// GET /analytics/posts/{postId}
export async function getAnalyzedPost(postId: string): Promise<AnalyzedPost> {
  const { data } = await client.get<ApiResponse<AnalyzedPost>>(`/analytics/posts/${postId}`);
  return data.result;
}

// ============================================================================
// Trang Phân tích tổng hợp (UI-08) — backend AnalyticsController (/analytics/*).
// Bộ lọc dùng chung: from/to (yyyy-MM-dd, mặc định 7 ngày gần nhất) + platforms
// (bỏ trống = mọi nền tảng). Chỉ FB/IG/Threads trong scope. So sánh luôn theo kỳ
// liền trước cùng độ dài; deltaPct = null khi kỳ trước bằng 0.
// ============================================================================

/** Một thẻ KPI: tổng trong kỳ + % thay đổi so kỳ trước + chuỗi/ngày để vẽ sparkline. */
export interface AnalyticsStat {
  total: number;
  /** null = kỳ trước bằng 0, không có mốc so sánh (hiển thị "—"). */
  deltaPct: number | null;
  /** Giá trị mỗi ngày trong kỳ, cũ → mới. */
  series: number[];
}

export interface AnalyticsSummary {
  from: string;
  to: string;
  rangeDays: number;
  /** Khoảng kỳ so sánh (kỳ liền trước cùng độ dài). */
  compareFrom: string;
  compareTo: string;
  views: AnalyticsStat;
  likes: AnalyticsStat;
  comments: AnalyticsStat;
  shares: AnalyticsStat;
}

/** Một điểm của biểu đồ đa series (khối C) — đã zero-fill mọi ngày trong kỳ. */
export interface AnalyticsPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface AnalyticsTimeseries {
  from: string;
  to: string;
  rangeDays: number;
  points: AnalyticsPoint[];
}

/** Hiệu suất một nền tảng (khối D). Luôn đủ 3 nền tảng, kể cả chưa kết nối. */
export interface AnalyticsPlatform {
  platform: Platform;
  /** false → FE hiển thị CTA "Kết nối ngay". */
  connected: boolean;
  accountName: string | null;
  avatarUrl: string | null;
  status: ConnectionStatus | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  /** Tỷ trọng tương tác của nền tảng trên tổng (%). */
  sharePct: number;
}

/** Một dòng bảng "Top bài viết hiệu quả" (khối E). MVP không có thumbnail. */
export interface AnalyticsTopPost {
  postId: string;
  contentItemId: string | null;
  platform: Platform;
  caption: string | null;
  accountName: string | null;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
}

/** Cột sắp xếp hợp lệ của bảng Top bài viết (whitelist, khớp backend). */
export type TopPostSortField = 'views' | 'likes' | 'comments' | 'shares' | 'engagement' | 'date';
export interface TopPostSort {
  field: TopPostSortField;
  asc: boolean;
}

// platforms → CSV; Spring bind chuỗi "FACEBOOK,THREADS" thành List<Platform>. Rỗng = bỏ tham số.
const platformsParam = (platforms?: Platform[]): string | undefined =>
  platforms && platforms.length > 0 ? platforms.join(',') : undefined;

// GET /analytics/summary — 4 KPI + so sánh kỳ trước (khối B).
export async function getAnalyticsSummary(from?: string, to?: string, platforms?: Platform[]): Promise<AnalyticsSummary> {
  const { data } = await client.get<ApiResponse<AnalyticsSummary>>("/analytics/summary", {
    params: { from, to, platforms: platformsParam(platforms) },
  });
  return data.result;
}

// GET /analytics/timeseries — chuỗi 4 metric theo ngày, đã zero-fill (khối C).
export async function getAnalyticsTimeseries(from?: string, to?: string, platforms?: Platform[]): Promise<AnalyticsTimeseries> {
  const { data } = await client.get<ApiResponse<AnalyticsTimeseries>>("/analytics/timeseries", {
    params: { from, to, platforms: platformsParam(platforms) },
  });
  return data.result;
}

// GET /analytics/by-platform — donut + danh sách nền tảng (khối D). KHÔNG nhận platforms.
export async function getAnalyticsByPlatform(from?: string, to?: string): Promise<AnalyticsPlatform[]> {
  const { data } = await client.get<ApiResponse<AnalyticsPlatform[]>>("/analytics/by-platform", {
    params: { from, to },
  });
  return data.result;
}

// GET /analytics/top-posts — bảng Top bài viết, sắp theo cột (khối E).
export async function getAnalyticsTopPosts(
  from?: string,
  to?: string,
  platforms?: Platform[],
  sort?: TopPostSort,
  limit = 10,
): Promise<AnalyticsTopPost[]> {
  const sortParam = sort ? `${sort.field},${sort.asc ? 'asc' : 'desc'}` : undefined;
  const { data } = await client.get<ApiResponse<AnalyticsTopPost[]>>("/analytics/top-posts", {
    params: { from, to, platforms: platformsParam(platforms), sort: sortParam, limit },
  });
  return data.result;
}

// POST /analytics/dev-seed — DEV-ONLY: sinh số liệu MẪU cho user hiện tại (dựng/demo UI).
// Gated cờ backend aima.dev.analytics-seed-enabled; trả số bài đã seed.
export async function devSeedAnalytics(): Promise<number> {
  const { data } = await client.post<ApiResponse<number>>("/analytics/dev-seed");
  return data.result;
}

// DELETE /analytics/dev-seed — DEV-ONLY: xoá sạch số liệu MẪU đã sinh.
export async function devSeedAnalyticsClear(): Promise<number> {
  const { data } = await client.delete<ApiResponse<number>>("/analytics/dev-seed");
  return data.result;
}
