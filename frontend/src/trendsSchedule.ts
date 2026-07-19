// Cấu hình "Lịch research tự động" của trang Xu hướng — lưu localStorage phía FE.
// Backend hiện chạy DailyTrendResearchJob cố định 02:00 cho brand đang hoạt động;
// cấu hình này là tùy chọn hiển thị/điều khiển phía người dùng (chưa có endpoint riêng).

export interface TrendSchedule {
  enabled: boolean;
  brandId: string;
  brandName: string;
  strategyId: string;
  strategyName: string;
  /** Tag nền tảng trong scope: FB | IG | TH. */
  platforms: string[];
  frequency: 'daily' | 'weekly';
  /** Chỉ dùng khi weekly: 0=T2 .. 6=CN. */
  days: number[];
  /** Giờ chạy dạng "HH:mm". */
  time: string;
}

const KEY = 'aima_trend_schedule';

export function loadTrendSchedule(): TrendSchedule | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrendSchedule) : null;
  } catch {
    return null;
  }
}

export function saveTrendSchedule(schedule: TrendSchedule): void {
  localStorage.setItem(KEY, JSON.stringify(schedule));
}
