import client, { type ApiResponse } from "./apiClient";
import type { Platform } from "./brandProfile";
import type { ConnectionStatus } from "./connections";

// Bảng điều khiển (UI-02) — backend DashboardController (/dashboard).
// MỘT lần gọi trả toàn bộ số liệu của trang thay cho 7 request rời rạc trước đây.
// Timeline "Hoạt động gần đây" KHÔNG nằm ở đây: trang tái dùng GET /notifications sẵn có.

/** Một thẻ số liệu: tổng tích lũy + % thay đổi 7 ngày + chuỗi 7 ngày để vẽ sparkline. */
export interface DashboardStat {
  total: number;
  /** null = kỳ trước bằng 0, không có mốc so sánh (hiển thị "—"). */
  deltaPct: number | null;
  /** 7 giá trị, cũ → mới. */
  series: number[];
}

export interface DashboardStats {
  total: DashboardStat;
  posted: DashboardStat;
  pending: DashboardStat;
  rejected: DashboardStat;
}

export interface DashboardPoint {
  /** yyyy-MM-dd. */
  date: string;
  reach: number;
  engagement: number;
}

export interface DashboardDistribution {
  /** Định dạng media của bản nền tảng; "OTHER" khi bản chưa được định dạng. */
  label: string;
  value: number;
  sharePct: number;
}

export interface DashboardTopic {
  name: string;
  posts: number;
  engagement: number;
}

export interface DashboardPlatform {
  platform: Platform;
  connected: boolean;
  accountName: string | null;
  avatarUrl: string | null;
  status: ConnectionStatus | null;
}

/** FR-86 — tiến độ thiết lập, backend suy ra từ dữ liệu thật (không lưu cột riêng). */
export interface DashboardOnboarding {
  brand: boolean;
  connection: boolean;
  strategy: boolean;
  content: boolean;
  completed: number;
  total: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  /** Dòng phụ của banner chào mừng — bài chờ duyệt (NEED_REVIEW). */
  awaitingReview: number;
  /** Dòng phụ của banner chào mừng — bài đã lên lịch (SCHEDULED). */
  scheduled: number;
  /** Đủ rangeDays điểm liên tục — ngày không có bài đăng đã được backend zero-fill. */
  performance: DashboardPoint[];
  rangeDays: number;
  contentTypes: DashboardDistribution[];
  topTopics: DashboardTopic[];
  /** Luôn đủ 3 nền tảng trong scope (FB/IG/Threads), kể cả chưa kết nối. */
  platforms: DashboardPlatform[];
  onboarding: DashboardOnboarding;
}

/** Khoảng thời gian của biểu đồ hiệu suất. */
export type DashboardRange = 7 | 30;

// GET /dashboard/summary?days=
export async function getDashboardSummary(days: DashboardRange = 7): Promise<DashboardSummary> {
  const { data } = await client.get<ApiResponse<DashboardSummary>>("/dashboard/summary", { params: { days } });
  return data.result;
}
