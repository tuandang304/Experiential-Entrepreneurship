import type { Platform } from './brandProfile';
import type {
  AnalyticsPlatform, AnalyticsPoint, AnalyticsStat, AnalyticsSummary,
  AnalyticsTimeseries, AnalyticsTopPost, TopPostSort,
} from './analytics';

/**
 * ⚠️ DỮ LIỆU MẪU (DEMO) — KHÔNG phải dữ liệu thật.
 *
 * Chỉ dùng để xem trước giao diện trang Phân tích khi CHƯA có số liệu thật / không muốn boot backend
 * (`.env` dev trỏ Postgres từ xa + scheduler đăng bài thật). Bật bằng cờ `VITE_USE_MOCK=true`; khi bật,
 * các hàm `getAnalytics*` trong `api/analytics.ts` trả về đây thay vì gọi backend. Sinh **tất định**
 * (không random) để render ổn định giữa các lần vẽ và tôn trọng bộ lọc (khoảng ngày / nền tảng / sort).
 * Không import ở bất kỳ luồng nghiệp vụ nào; production để cờ tắt.
 */

// ---- date helpers (local time) ----
const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());
const shiftISO = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(new Date(y, m - 1, d + days));
};
/** Danh sách ISO ngày từ from → to (đã bao gồm hai đầu). */
function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  let cur = from;
  // Chặn vòng lặp vô hạn nếu from > to (kẹp 400 ngày).
  for (let i = 0; i < 400 && cur <= to; i++) {
    out.push(cur);
    cur = shiftISO(cur, 1);
  }
  return out;
}

/** Hàm băm tất định chuỗi → [0,1) để sinh số ổn định (thay cho Math.random). */
function seed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// Trọng số đóng góp mỗi nền tảng — dùng để scale số liệu khi lọc theo nền tảng.
const WEIGHT: Record<Platform, number> = { FACEBOOK: 0.5, INSTAGRAM: 0.35, THREADS: 0.15 };
const factorOf = (platforms?: Platform[]) =>
  platforms && platforms.length > 0 ? platforms.reduce((s, p) => s + (WEIGHT[p] ?? 0), 0) : 1;

const defFrom = () => shiftISO(todayISO(), -6);

/** Số liệu 4 metric theo từng ngày — sóng mượt + xu hướng tăng nhẹ, jitter tất định theo ngày. */
function dailyPoints(dates: string[], factor: number): AnalyticsPoint[] {
  return dates.map((date, idx) => {
    const wave = Math.sin(idx / 2.4) * 0.3 + Math.sin(idx / 5.5) * 0.22;
    const jitter = 0.8 + seed(date) * 0.5; // 0.8 → 1.3
    const views = Math.max(0, Math.round((900 + idx * 22 + wave * 520) * jitter * factor));
    const likes = Math.round(views * (0.07 + 0.02 * seed('l' + date)));
    const comments = Math.round(views * (0.015 + 0.01 * seed('c' + date)));
    const shares = Math.round(views * (0.008 + 0.006 * seed('s' + date)));
    return { date, views, likes, comments, shares };
  });
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

/** deltaPct tất định trong khoảng ~[-15, +38] để badge tăng/giảm sinh động. */
function mockDelta(key: string): number {
  return Math.round((seed('d' + key) * 53 - 15) * 10) / 10;
}

function statOf(series: number[], key: string): AnalyticsStat {
  return { total: sum(series), deltaPct: series.length ? mockDelta(key) : null, series };
}

// ---- builders (khớp shape DTO backend) ----

export function mockTimeseries(from = defFrom(), to = todayISO(), platforms?: Platform[]): AnalyticsTimeseries {
  const dates = dateRange(from, to);
  const points = dailyPoints(dates, factorOf(platforms));
  return { from, to, rangeDays: dates.length, points };
}

export function mockSummary(from = defFrom(), to = todayISO(), platforms?: Platform[]): AnalyticsSummary {
  const dates = dateRange(from, to);
  const points = dailyPoints(dates, factorOf(platforms));
  const rangeDays = dates.length;
  return {
    from, to, rangeDays,
    compareFrom: shiftISO(from, -rangeDays),
    compareTo: shiftISO(from, -1),
    views: statOf(points.map((p) => p.views), 'views' + from),
    likes: statOf(points.map((p) => p.likes), 'likes' + from),
    comments: statOf(points.map((p) => p.comments), 'comments' + from),
    shares: statOf(points.map((p) => p.shares), 'shares' + from),
  };
}

export function mockByPlatform(from = defFrom(), to = todayISO()): AnalyticsPlatform[] {
  // Tổng theo nền tảng suy từ cùng chuỗi ngày để nhất quán với KPI/chart.
  const dates = dateRange(from, to);
  const totalViews = sum(dailyPoints(dates, 1).map((p) => p.views));

  // FB + IG đã kết nối (có số liệu); Threads CHƯA kết nối để minh hoạ CTA "Kết nối ngay".
  const base: Omit<AnalyticsPlatform, 'engagement' | 'sharePct'>[] = [
    {
      platform: 'FACEBOOK', connected: true, accountName: 'AIMA Fanpage', avatarUrl: null, status: 'ACTIVE',
      views: Math.round(totalViews * 0.5), likes: Math.round(totalViews * 0.5 * 0.08),
      comments: Math.round(totalViews * 0.5 * 0.02), shares: Math.round(totalViews * 0.5 * 0.011),
    },
    {
      platform: 'INSTAGRAM', connected: true, accountName: '@aima.official', avatarUrl: null, status: 'ACTIVE',
      views: Math.round(totalViews * 0.35), likes: Math.round(totalViews * 0.35 * 0.11),
      comments: Math.round(totalViews * 0.35 * 0.025), shares: Math.round(totalViews * 0.35 * 0.009),
    },
    {
      platform: 'THREADS', connected: false, accountName: null, avatarUrl: null, status: null,
      views: 0, likes: 0, comments: 0, shares: 0,
    },
  ];

  const withEng = base.map((p) => ({ ...p, engagement: p.likes + p.comments + p.shares }));
  const totalEng = sum(withEng.map((p) => p.engagement)) || 1;
  return withEng.map((p) => ({ ...p, sharePct: Math.round((p.engagement / totalEng) * 1000) / 10 }));
}

const CAPTIONS = [
  'Bí quyết chăm sóc da mùa hè cho làn da luôn khỏe mạnh',
  '5 xu hướng marketing không thể bỏ lỡ trong năm 2026',
  'Cách xây dựng thương hiệu cá nhân từ con số 0',
  'Review sản phẩm mới: có thật sự đáng tiền không?',
  'Hậu trường buổi chụp hình bộ sưu tập mùa thu',
  'Mẹo tăng tương tác tự nhiên trên mạng xã hội',
  'Câu chuyện khách hàng: hành trình chuyển đổi ngoạn mục',
  'Livestream ra mắt sản phẩm — ưu đãi độc quyền',
  'Top 3 công cụ AI hỗ trợ sáng tạo nội dung nhanh hơn',
  'Ưu đãi đặc biệt cuối tuần — số lượng có hạn',
  'Chia sẻ quy trình lên kế hoạch nội dung 30 ngày',
  'Những lỗi thường gặp khi mới bắt đầu bán hàng online',
  'Cách viết caption thu hút chỉ trong 3 bước đơn giản',
  'Xu hướng màu sắc thương hiệu được ưa chuộng năm nay',
  'Bí kíp lên lịch đăng bài để tiếp cận tối đa',
  'Phân tích 1 chiến dịch viral: vì sao nó thành công?',
  'Checklist chuẩn bị trước khi ra mắt sản phẩm mới',
  'Hỏi đáp cùng chuyên gia: xây dựng cộng đồng trung thành',
  'Mini game cuối tháng — nhận quà cực hấp dẫn',
  'Tổng kết hiệu quả nội dung tháng qua & bài học rút ra',
];

export function mockTopPosts(
  from = defFrom(), to = todayISO(), platforms?: Platform[], sort?: TopPostSort, limit = 10,
): AnalyticsTopPost[] {
  const dates = dateRange(from, to);
  // Chỉ nền tảng ĐÃ kết nối mới có bài (Threads chưa kết nối); tôn trọng bộ lọc nền tảng.
  const connected: Platform[] = ['FACEBOOK', 'INSTAGRAM'];
  const pool = platforms && platforms.length > 0 ? connected.filter((p) => platforms.includes(p)) : connected;
  const account: Record<string, string> = { FACEBOOK: 'AIMA Fanpage', INSTAGRAM: '@aima.official' };

  const rows: AnalyticsTopPost[] = pool.length === 0 ? [] : CAPTIONS.map((caption, i) => {
    const platform = pool[i % pool.length];
    // Rải đều bài trong khoảng đã chọn để luôn hiển thị dù đổi preset.
    const date = dates[Math.floor((i / CAPTIONS.length) * dates.length)] ?? dates[dates.length - 1] ?? to;
    const r = seed(caption);
    const views = Math.round(1200 + r * 6400);
    const likes = Math.round(views * (0.06 + 0.05 * seed('l' + caption)));
    const comments = Math.round(views * (0.01 + 0.02 * seed('c' + caption)));
    const shares = Math.round(views * (0.006 + 0.012 * seed('s' + caption)));
    return {
      postId: `mock-${i}`,
      contentItemId: `mock-item-${i}`,
      platform,
      caption,
      accountName: account[platform],
      publishedAt: `${date}T${pad(8 + (i % 10))}:${pad((i * 7) % 60)}:00`,
      views, likes, comments, shares,
      engagement: likes + comments + shares,
    };
  });

  // Sắp xếp theo cột (whitelist) — khớp hành vi backend, thay cho query thật.
  const field = sort?.field ?? 'views';
  const asc = sort?.asc ?? false;
  const key = (row: AnalyticsTopPost): number =>
    field === 'date' ? new Date(row.publishedAt).getTime() : (row[field] as number);
  rows.sort((a, b) => (asc ? key(a) - key(b) : key(b) - key(a)));

  return rows.slice(0, Math.min(Math.max(limit, 1), 50));
}
