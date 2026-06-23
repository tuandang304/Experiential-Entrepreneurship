import type { Lang } from '../types';
import type { Tone } from '../components/admin/StatusBadge';

// ⚠️ TODO(backend): toàn bộ file này hiện trả MOCK để dựng UI Quản trị hệ thống.
// Khi BE sẵn sàng, thay phần thân mỗi hàm bằng lời gọi `client.get(...)` qua
// api/apiClient.ts (envelope { code, message, result }) — GIỮ NGUYÊN chữ ký hàm
// để các trang admin không phải đổi. Endpoint dự kiến ghi chú ở từng hàm.

// Giả lập độ trễ mạng để các trang thể hiện đúng trạng thái loading.
const delay = <T>(value: T, ms = 450): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

const P = (lang: Lang, vi: string, en: string) => (lang === 'en' ? en : vi);
const initials = (name: string) => name.trim().split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase();

export const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ===== Quản lý người dùng (FR-80) — GET /admin/users =====
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING_DELETE';
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  initials: string;
}

const USERS_RAW: [string, string, string, UserRole, UserStatus, string][] = [
  ['u01', 'Lan Phương', 'lan.phuong@gmail.com', 'USER', 'ACTIVE', '2026-01-12'],
  ['u02', 'Minh Tuấn', 'tuan.minh@aima.io', 'ADMIN', 'ACTIVE', '2025-11-03'],
  ['u03', 'Thu Hà', 'ha.thu@brandco.vn', 'USER', 'LOCKED', '2026-02-28'],
  ['u04', 'David Chen', 'david.chen@startup.co', 'USER', 'ACTIVE', '2026-03-15'],
  ['u05', 'Ngọc Anh', 'anh.ngoc@gmail.com', 'USER', 'PENDING_DELETE', '2026-06-18'],
  ['u06', 'Hoàng Long', 'long.hoang@smes.vn', 'USER', 'ACTIVE', '2026-04-02'],
  ['u07', 'Mai Chi', 'chi.mai@creator.vn', 'USER', 'ACTIVE', '2026-05-21'],
  ['u08', 'Bảo Nam', 'nam.bao@gmail.com', 'USER', 'LOCKED', '2026-01-30'],
  ['u09', 'Sophie Tran', 'sophie@agency.co', 'ADMIN', 'ACTIVE', '2025-12-09'],
  ['u10', 'Quang Huy', 'huy.quang@shop.vn', 'USER', 'ACTIVE', '2026-06-01'],
  ['u11', 'Diệu Linh', 'linh.dieu@gmail.com', 'USER', 'ACTIVE', '2026-03-26'],
  ['u12', 'Trung Kiên', 'kien.trung@biz.vn', 'USER', 'PENDING_DELETE', '2026-05-08'],
];

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const rows = USERS_RAW.map((u) => ({ id: u[0], name: u[1], email: u[2], role: u[3], status: u[4], createdAt: u[5], initials: initials(u[1]) }));
  return delay(rows);
}

export const userStatusMeta = (lang: Lang, s: UserStatus): { tone: Tone; label: string } =>
  s === 'ACTIVE' ? { tone: 'success', label: P(lang, 'Hoạt động', 'Active') }
  : s === 'LOCKED' ? { tone: 'danger', label: P(lang, 'Đã khoá', 'Locked') }
  : { tone: 'warning', label: P(lang, 'Chờ xoá', 'Pending deletion') };

// PATCH /admin/users/{id}/lock | /unlock
export async function setUserLocked(id: string, locked: boolean): Promise<{ id: string; status: UserStatus }> {
  return delay({ id, status: locked ? 'LOCKED' : 'ACTIVE' });
}

// ===== Bài đăng lỗi & bị từ chối (FR-82 + FR-83) — GET /admin/posts/problems =====
export type PostProblemKind = 'rejected' | 'system';
export interface AdminPostProblem {
  id: string;
  user: string;
  platform: 'FB' | 'IG' | 'TH';
  kind: PostProblemKind;
  reason: string;
  platformError: string; // mã/thông điệp nền tảng trả về
  content: string;
  date: string;
}

export async function getPostProblems(lang: Lang): Promise<AdminPostProblem[]> {
  const rows: AdminPostProblem[] = [
    { id: 'p01', user: 'Lan Phương', platform: 'FB', kind: 'rejected', reason: P(lang, 'Vi phạm chính sách quảng cáo', 'Ad policy violation'), platformError: 'GraphAPI #368: Temporarily blocked for policies violations', content: P(lang, 'Giảm giá 50% toàn bộ khoá học...', '50% off all courses...'), date: '2026-06-22 09:14' },
    { id: 'p02', user: 'David Chen', platform: 'IG', kind: 'rejected', reason: P(lang, 'Nội dung bị gắn cờ bản quyền', 'Flagged for copyright'), platformError: 'IG Media #2207026: Copyrighted audio detected', content: P(lang, 'Reel nhạc nền trending...', 'Reel with trending audio...'), date: '2026-06-22 08:02' },
    { id: 'p03', user: 'Mai Chi', platform: 'TH', kind: 'system', reason: P(lang, 'Hết thời gian chờ khi gọi API', 'API call timeout'), platformError: 'ETIMEDOUT: upstream did not respond within 30s', content: P(lang, 'Thread: 5 mẹo marketing...', 'Thread: 5 marketing tips...'), date: '2026-06-21 20:41' },
    { id: 'p04', user: 'Hoàng Long', platform: 'FB', kind: 'system', reason: P(lang, 'Định dạng media không hợp lệ', 'Invalid media format'), platformError: 'GraphAPI #324: Missing or invalid image file', content: P(lang, 'Bài viết kèm ảnh sản phẩm...', 'Post with product image...'), date: '2026-06-21 16:25' },
    { id: 'p05', user: 'Quang Huy', platform: 'IG', kind: 'rejected', reason: P(lang, 'Tài khoản bị hạn chế đăng bài', 'Account restricted from posting'), platformError: 'IG #190: This account is restricted', content: P(lang, 'Carousel ra mắt bộ sưu tập...', 'Carousel: new collection launch...'), date: '2026-06-21 11:08' },
    { id: 'p06', user: 'Diệu Linh', platform: 'TH', kind: 'system', reason: P(lang, 'Lỗi máy chủ nội bộ', 'Internal server error'), platformError: 'HTTP 500: scheduler worker crashed', content: P(lang, 'Thread: hậu trường thương hiệu...', 'Thread: brand behind-the-scenes...'), date: '2026-06-20 22:13' },
  ];
  return delay(rows);
}

// ===== Trạng thái hệ thống (FR-81) — GET /admin/system/status =====
export type ServiceStatus = 'operational' | 'degraded' | 'down';
export interface SystemStatus {
  services: { name: string; status: ServiceStatus; uptime: string }[];
  load: number[]; // % tải 24 mốc (mỗi giờ)
  alerts: { id: string; tone: Tone; level: string; message: string; time: string }[];
}

export async function getSystemStatus(lang: Lang): Promise<SystemStatus> {
  return delay({
    services: [
      { name: P(lang, 'Cơ sở dữ liệu (PostgreSQL)', 'Database (PostgreSQL)'), status: 'operational', uptime: '99.98%' },
      { name: P(lang, 'API nền tảng (Facebook)', 'Platform API (Facebook)'), status: 'operational', uptime: '99.92%' },
      { name: P(lang, 'API nền tảng (Instagram)', 'Platform API (Instagram)'), status: 'degraded', uptime: '98.40%' },
      { name: P(lang, 'API nền tảng (Threads)', 'Platform API (Threads)'), status: 'operational', uptime: '99.81%' },
      { name: P(lang, 'Hàng đợi tác vụ', 'Job queue'), status: 'operational', uptime: '99.95%' },
      { name: P(lang, 'Bộ máy AI', 'AI engine'), status: 'operational', uptime: '99.70%' },
    ],
    load: [32, 28, 24, 22, 26, 30, 44, 58, 67, 72, 70, 64, 60, 66, 74, 82, 88, 79, 71, 63, 55, 48, 40, 35],
    alerts: [
      { id: 'a1', tone: 'warning', level: 'WARN', message: P(lang, 'Instagram API phản hồi chậm (>2s) trong 15 phút qua', 'Instagram API latency high (>2s) for the last 15 min'), time: '2026-06-23 10:12' },
    ],
  });
}

// ===== Log hệ thống (FR-84) — GET /admin/logs =====
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export interface SystemLog {
  id: string;
  time: string; // ISO-ish, dùng cho lọc theo ngày (lấy 10 ký tự đầu)
  level: LogLevel;
  module: string;
  message: string;
}

export const logLevelTone = (level: LogLevel): Tone =>
  level === 'ERROR' ? 'danger' : level === 'WARN' ? 'warning' : level === 'INFO' ? 'info' : 'neutral';

export async function getSystemLogs(): Promise<SystemLog[]> {
  const rows: SystemLog[] = [
    { id: 'l01', time: '2026-06-23 10:12:04', level: 'WARN', module: 'platform.instagram', message: 'Rate limit approaching: 480/500 calls in current window' },
    { id: 'l02', time: '2026-06-23 09:48:31', level: 'ERROR', module: 'scheduler.worker', message: 'Job #88213 failed: ETIMEDOUT calling Threads publish endpoint' },
    { id: 'l03', time: '2026-06-23 09:05:17', level: 'INFO', module: 'auth.session', message: 'User u09 signed in from 113.161.* (Chrome/Win)' },
    { id: 'l04', time: '2026-06-23 08:22:50', level: 'ERROR', module: 'platform.facebook', message: 'GraphAPI #324 invalid media for post #44021' },
    { id: 'l05', time: '2026-06-22 23:41:09', level: 'DEBUG', module: 'ai.generate', message: 'Prompt tokens=1820 completion=642 latency=3.1s' },
    { id: 'l06', time: '2026-06-22 20:41:33', level: 'WARN', module: 'queue.retry', message: 'Post #43980 scheduled retry 2/3 in 15m (temporary error)' },
    { id: 'l07', time: '2026-06-22 18:30:02', level: 'INFO', module: 'billing.invoice', message: 'Invoice INV-2026-0612 paid by customer u04' },
    { id: 'l08', time: '2026-06-22 14:10:55', level: 'ERROR', module: 'db.pool', message: 'Connection pool exhausted (20/20), 3 queries queued' },
    { id: 'l09', time: '2026-06-21 11:08:12', level: 'WARN', module: 'platform.instagram', message: 'Account u10 restricted — posting blocked by platform' },
    { id: 'l10', time: '2026-06-21 07:55:44', level: 'INFO', module: 'analytics.collector', message: 'Collected 7d metrics for 142 posts' },
    { id: 'l11', time: '2026-06-20 22:13:20', level: 'ERROR', module: 'scheduler.worker', message: 'HTTP 500 worker crashed, auto-restarted in 4s' },
    { id: 'l12', time: '2026-06-20 16:02:38', level: 'DEBUG', module: 'cache.redis', message: 'Cache miss ratio 12.4% over last hour' },
  ];
  return delay(rows);
}

// ===== Version API nền tảng — GET /admin/platform-versions =====
export interface PlatformVersion {
  platform: 'FB' | 'IG' | 'TH';
  name: string;
  current: string;
  latest: string;
  history: { version: string; date: string; note: string }[];
}

export async function getPlatformVersions(lang: Lang): Promise<PlatformVersion[]> {
  return delay([
    { platform: 'FB', name: 'Facebook Graph API', current: 'v19.0', latest: 'v20.0', history: [
      { version: 'v19.0', date: '2026-02-01', note: P(lang, 'Đang dùng — ổn định', 'In use — stable') },
      { version: 'v18.0', date: '2025-09-12', note: P(lang, 'Ngừng hỗ trợ 2026-09', 'Deprecated 2026-09') },
    ] },
    { platform: 'IG', name: 'Instagram Graph API', current: 'v19.0', latest: 'v19.0', history: [
      { version: 'v19.0', date: '2026-02-01', note: P(lang, 'Đang dùng — mới nhất', 'In use — latest') },
      { version: 'v18.0', date: '2025-09-12', note: P(lang, 'Đã nâng cấp', 'Upgraded') },
    ] },
    { platform: 'TH', name: 'Threads API', current: 'v1.0', latest: 'v1.1', history: [
      { version: 'v1.0', date: '2025-11-20', note: P(lang, 'Đang dùng', 'In use') },
      { version: 'v0.9', date: '2025-08-04', note: P(lang, 'Bản beta', 'Beta') },
    ] },
  ]);
}

// PATCH /admin/platform-versions/{platform} { version }
export async function updatePlatformVersion(platform: string, version: string): Promise<{ platform: string; current: string }> {
  return delay({ platform, current: version });
}

// ===== Quản lý doanh thu — GET /admin/revenue?period= =====
export type RevenuePeriod = '1m' | '3m' | '12m';
export interface RevenueData {
  total: number;
  orders: number;
  growth: string;
  series: { label: string; value: number }[];
  transactions: { id: string; customer: string; plan: string; amount: number; tone: Tone; status: string; date: string }[];
}

export async function getRevenue(period: RevenuePeriod, lang: Lang): Promise<RevenueData> {
  const paid = P(lang, 'Đã thanh toán', 'Paid');
  const pending = P(lang, 'Chờ xử lý', 'Pending');
  const refunded = P(lang, 'Hoàn tiền', 'Refunded');
  const series: Record<RevenuePeriod, { label: string; value: number }[]> = {
    '1m': Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: 8 + Math.round(6 * Math.sin(i / 3) + i / 4) })),
    '3m': Array.from({ length: 12 }, (_, i) => ({ label: 'W' + (i + 1), value: 60 + Math.round(30 * Math.sin(i / 2) + i * 2) })),
    '12m': (lang === 'en' ? ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
      .map((label, i) => ({ label, value: 220 + Math.round(120 * Math.sin(i / 2) + i * 12) })),
  };
  const totals: Record<RevenuePeriod, [number, number, string]> = {
    '1m': [48_600_000, 312, '+11.2%'],
    '3m': [151_400_000, 968, '+8.7%'],
    '12m': [612_900_000, 4128, '+24.3%'],
  };
  const [total, orders, growth] = totals[period];
  const transactions = [
    { id: 'INV-0612', customer: 'David Chen', plan: 'Pro', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-22' },
    { id: 'INV-0611', customer: 'Sophie Tran', plan: 'Business', amount: 1_990_000, tone: 'success' as Tone, status: paid, date: '2026-06-22' },
    { id: 'INV-0610', customer: 'Mai Chi', plan: 'Pro', amount: 499_000, tone: 'warning' as Tone, status: pending, date: '2026-06-21' },
    { id: 'INV-0609', customer: 'Hoàng Long', plan: 'Pro', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-21' },
    { id: 'INV-0608', customer: 'Quang Huy', plan: 'Business', amount: 1_990_000, tone: 'danger' as Tone, status: refunded, date: '2026-06-20' },
    { id: 'INV-0607', customer: 'Diệu Linh', plan: 'Pro', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-20' },
  ];
  return delay({ total, orders, growth, series: series[period], transactions });
}

// GET/PUT/POST /admin/plans — cấu hình giá gói
export interface PricingPlan {
  id: string;
  name: string;
  price: number; // đ/tháng
  active: boolean;
}

export async function getPlans(): Promise<PricingPlan[]> {
  return delay([
    { id: 'free', name: 'Free', price: 0, active: true },
    { id: 'pro', name: 'Pro', price: 499_000, active: true },
    { id: 'business', name: 'Business', price: 1_990_000, active: true },
  ]);
}

// TODO(backend): PUT /admin/plans/{id} & POST /admin/plans — hiện chỉ trả lại payload.
export async function savePlan(plan: PricingPlan): Promise<PricingPlan> {
  return delay(plan);
}
