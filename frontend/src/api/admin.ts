import type { Lang } from '../types';
import type { Tone } from '../components/admin/StatusBadge';
import client, { type ApiError, type ApiResponse, type PageResponse } from './apiClient';

// 2026-07-11: users (list/lock/unlock), bài thất bại (FR-82/83), system status (FR-81) và
// logs (FR-84) đã nối BE thật — GIỮ NGUYÊN chữ ký hàm nên các trang admin không phải đổi.
// Còn MOCK: tạo/sửa/xóa user thủ công (chưa có endpoint BE) và Revenue (chưa có billing BE).

// Giả lập độ trễ mạng để các trang thể hiện đúng trạng thái loading.
const delay = <T>(value: T, ms = 450): Promise<T> => new Promise((r) => setTimeout(() => r(value), ms));

const P = (lang: Lang, vi: string, en: string) => (lang === 'en' ? en : vi);
const initials = (name: string) => name.trim().split(/\s+/).map((w) => w[0]).slice(-2).join('').toUpperCase();

export const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ===== Quản lý người dùng (FR-80) — GET /admin/users =====
export type UserRole = 'USER' | 'ADMIN';
// PENDING_ACTIVATION: tài khoản vừa tạo, chờ user kích hoạt qua email mời (chưa đăng nhập lần nào).
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'PENDING_ACTIVATION' | 'PENDING_DELETE';
export type UserPlan = 'free' | 'plus' | 'pro';
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  initials: string;
  plan: UserPlan;
  channelsUsed: number;
  channelsLimit: number;
  tokenUsagePercent: number;
  /** 'YYYY-MM-DD HH:mm' — null = chưa đăng nhập lần nào. */
  lastLoginAt: string | null;
  /** SĐT (tuỳ chọn) — undefined nếu người dùng chưa cung cấp. */
  phone?: string;
}

/** Giới hạn kênh kết nối theo gói (mock, khớp quyền lợi gói). */
export const PLAN_LIMITS: Record<UserPlan, number> = { free: 1, plus: 2, pro: 4 };

const USERS_RAW: [string, string, string, UserRole, UserStatus, string, UserPlan, number, number, string | null, string | null][] = [
  // [id, tên, email, vai trò, trạng thái, ngày tạo, gói, kênh đang dùng, % token, đăng nhập gần nhất, SĐT]
  ['u01', 'Lan Phương', 'lan.phuong@gmail.com', 'USER', 'ACTIVE', '2026-01-12', 'pro', 3, 62, '2026-07-02 09:15', '0901234567'],
  ['u02', 'Minh Tuấn', 'tuan.minh@aima.io', 'ADMIN', 'ACTIVE', '2025-11-03', 'pro', 4, 45, '2026-07-02 07:40', '0902345001'],
  ['u03', 'Thu Hà', 'ha.thu@brandco.vn', 'USER', 'LOCKED', '2026-02-28', 'free', 1, 96, '2026-05-19 14:02', '0903120945'],
  ['u04', 'David Chen', 'david.chen@startup.co', 'USER', 'ACTIVE', '2026-03-15', 'plus', 2, 88, '2026-07-01 22:10', null],
  ['u05', 'Ngọc Anh', 'anh.ngoc@gmail.com', 'USER', 'PENDING_DELETE', '2026-06-18', 'free', 0, 5, '2026-05-25 08:00', '0905667788'],
  ['u06', 'Hoàng Long', 'long.hoang@smes.vn', 'USER', 'ACTIVE', '2026-04-02', 'plus', 1, 73, '2026-06-30 18:45', '0906778899'],
  ['u07', 'Mai Chi', 'chi.mai@creator.vn', 'USER', 'ACTIVE', '2026-05-21', 'pro', 2, 91, '2026-07-02 06:05', '0907889900'],
  ['u08', 'Bảo Nam', 'nam.bao@gmail.com', 'USER', 'LOCKED', '2026-01-30', 'free', 1, 34, '2026-04-27 10:30', '0908990011'],
  ['u09', 'Sophie Tran', 'sophie@agency.co', 'ADMIN', 'ACTIVE', '2025-12-09', 'pro', 3, 28, '2026-07-01 16:20', null],
  ['u10', 'Quang Huy', 'huy.quang@shop.vn', 'USER', 'ACTIVE', '2026-06-01', 'plus', 2, 79, '2026-06-29 21:00', '0910112233'],
  ['u11', 'Diệu Linh', 'linh.dieu@gmail.com', 'USER', 'ACTIVE', '2026-03-26', 'free', 1, 55, '2026-06-28 12:40', '0911223344'],
  ['u12', 'Trung Kiên', 'kien.trung@biz.vn', 'USER', 'PENDING_DELETE', '2026-05-08', 'free', 0, 12, '2026-05-30 09:25', '0912334455'],
  ['u13', 'Khánh Vy', 'vy.khanh@studio.vn', 'USER', 'PENDING_ACTIVATION', '2026-07-01', 'plus', 0, 0, null, '0913445566'],
  ['u14', 'Tuấn Anh', 'anh.tuan@freelance.vn', 'USER', 'ACTIVE', '2026-07-02', 'free', 0, 0, null, null],
];

// Trạng thái mock giữ trong module để lock/xoá/tạo phản ánh qua các lần getAdminUsers
// trong cùng phiên (mô phỏng DB) — reload trang sẽ seed lại.
let USERS: AdminUserRow[] | null = null;
const seedUsers = (): AdminUserRow[] =>
  USERS_RAW.map((u) => ({
    id: u[0], name: u[1], email: u[2], role: u[3], status: u[4], createdAt: u[5], initials: initials(u[1]),
    plan: u[6], channelsUsed: u[7], channelsLimit: PLAN_LIMITS[u[6]], tokenUsagePercent: u[8], lastLoginAt: u[9],
    phone: u[10] ?? undefined,
  }));
const users = (): AdminUserRow[] => (USERS ??= seedUsers());

// ==== BE thật: shape UserResponse của backend (GET /users, admin) ====
interface BeUserResponse {
  id: string;
  username: string | null;
  fullName: string | null;
  email: string;
  phone: string | null;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  role: { roleName: UserRole } | null;
}

const ERR_USER_LIST_EMPTY = 1018;
const ERR_ADMIN_PROTECTED = 1972;

const beDateTime = (iso: string | null): string | null => (iso ? iso.slice(0, 16).replace('T', ' ') : null);

// Gói/kênh/token là khái niệm billing chưa có ở BE — hiển thị mặc định Free/0.
const toAdminRow = (u: BeUserResponse): AdminUserRow => ({
  id: u.id,
  name: u.fullName || u.email,
  email: u.email,
  role: u.role?.roleName === 'ADMIN' ? 'ADMIN' : 'USER',
  status: u.status,
  createdAt: (u.createdAt ?? '').slice(0, 10),
  initials: initials(u.fullName || u.email),
  plan: 'free',
  channelsUsed: 0,
  channelsLimit: PLAN_LIMITS.free,
  tokenUsagePercent: 0,
  lastLoginAt: beDateTime(u.lastActiveAt),
  phone: u.phone ?? undefined,
});

// GET /users (ADMIN, FR-80) — trang admin lọc/tìm client-side nên lấy một trang lớn.
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  try {
    const { data } = await client.get<ApiResponse<PageResponse<BeUserResponse>>>('/users', {
      params: { size: 200 },
    });
    USERS = data.result.content.map(toAdminRow);
    return USERS.map((u) => ({ ...u }));
  } catch (e) {
    if ((e as ApiError).code === ERR_USER_LIST_EMPTY) {
      USERS = [];
      return [];
    }
    throw e;
  }
}

export const userStatusMeta = (lang: Lang, s: UserStatus): { tone: Tone; label: string } =>
  s === 'ACTIVE' ? { tone: 'success', label: P(lang, 'Hoạt động', 'Active') }
  : s === 'LOCKED' ? { tone: 'danger', label: P(lang, 'Đã khoá', 'Locked') }
  : s === 'PENDING_ACTIVATION' ? { tone: 'info', label: P(lang, 'Chờ kích hoạt', 'Pending activation') }
  : { tone: 'warning', label: P(lang, 'Chờ xoá', 'Pending deletion') };

export const userPlanMeta = (p: UserPlan): { tone: Tone; label: string } =>
  p === 'free' ? { tone: 'neutral', label: 'Free' } : p === 'plus' ? { tone: 'info', label: 'Plus' } : { tone: 'purple', label: 'Pro' };

/** Thời gian tương đối cho "Lần đăng nhập gần nhất". */
export function timeAgo(lang: Lang, iso: string | null): string {
  if (!iso) return P(lang, 'Chưa đăng nhập', 'Never');
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso.replace(' ', 'T')).getTime()) / 60000));
  if (mins < 1) return P(lang, 'Vừa xong', 'Just now');
  if (mins < 60) return P(lang, `${mins} phút trước`, `${mins}m ago`);
  const hours = Math.round(mins / 60);
  if (hours < 24) return P(lang, `${hours} giờ trước`, `${hours}h ago`);
  const days = Math.round(hours / 24);
  if (days < 30) return P(lang, `${days} ngày trước`, `${days}d ago`);
  const months = Math.round(days / 30);
  return P(lang, `${months} tháng trước`, `${months}mo ago`);
}

/** Số ngày kể từ lần đăng nhập cuối (Infinity nếu chưa từng đăng nhập). */
export const daysSinceLogin = (iso: string | null): number =>
  iso ? Math.floor((Date.now() - new Date(iso.replace(' ', 'T')).getTime()) / 86_400_000) : Infinity;

// PATCH /users/{id}/status (ADMIN, FR-80) — BE bảo vệ tài khoản ADMIN (mã 1972 → 'ADMIN_PROTECTED'
// để giữ nguyên cách các trang admin xử lý lỗi).
export async function setUserLocked(id: string, locked: boolean): Promise<{ id: string; status: UserStatus }> {
  try {
    const { data } = await client.patch<ApiResponse<BeUserResponse>>(`/users/${id}/status`, {
      status: locked ? 'LOCKED' : 'ACTIVE',
    });
    const u = users().find((x) => x.id === id);
    if (u) u.status = data.result.status;
    return { id, status: data.result.status };
  } catch (e) {
    if ((e as ApiError).code === ERR_ADMIN_PROTECTED) throw new Error('ADMIN_PROTECTED');
    throw e;
  }
}

// Khóa/mở hàng loạt = lặp PATCH /users/{id}/status; ADMIN bị BE từ chối → đếm vào skippedAdmins.
export async function setUsersLocked(ids: string[], locked: boolean): Promise<{ updated: string[]; skippedAdmins: number }> {
  const updated: string[] = [];
  let skippedAdmins = 0;
  for (const id of ids) {
    try {
      await setUserLocked(id, locked);
      updated.push(id);
    } catch (e) {
      if ((e as Error).message === 'ADMIN_PROTECTED') skippedAdmins += 1;
      else throw e;
    }
  }
  return { updated, skippedAdmins };
}

// DELETE /admin/users/{id} — guard: ADMIN không thể bị xoá.
export async function deleteAdminUser(id: string): Promise<{ id: string }> {
  const u = users().find((x) => x.id === id);
  if (u?.role === 'ADMIN') return Promise.reject(new Error('ADMIN_PROTECTED'));
  USERS = users().filter((x) => x.id !== id);
  return delay({ id });
}

// POST /admin/users — tạo user thủ công (mock: thêm vào đầu danh sách).
// status: ACTIVE (đặt mật khẩu thủ công) | PENDING_ACTIVATION (gửi email mời kích hoạt).
export async function createAdminUser(input: {
  name: string; email: string; role: UserRole; plan: UserPlan; phone?: string; status?: UserStatus;
}): Promise<AdminUserRow> {
  const row: AdminUserRow = {
    id: 'u' + Date.now().toString(36),
    name: input.name, email: input.email, role: input.role, status: input.status ?? 'ACTIVE',
    createdAt: new Date().toISOString().slice(0, 10), initials: initials(input.name),
    plan: input.plan, channelsUsed: 0, channelsLimit: PLAN_LIMITS[input.plan], tokenUsagePercent: 0, lastLoginAt: null,
    phone: input.phone,
  };
  users().unshift(row);
  return delay({ ...row });
}

// PATCH /admin/users/{id} — cập nhật thông tin tài khoản (mock). Đổi gói → cập nhật lại giới hạn kênh.
export async function updateAdminUser(id: string, patch: {
  name: string; email: string; phone?: string; role: UserRole; plan: UserPlan; status: UserStatus;
}): Promise<AdminUserRow> {
  const u = users().find((x) => x.id === id);
  if (!u) return Promise.reject(new Error('NOT_FOUND'));
  u.name = patch.name;
  u.email = patch.email;
  u.phone = patch.phone;
  u.role = patch.role;
  u.plan = patch.plan;
  u.channelsLimit = PLAN_LIMITS[patch.plan];
  u.status = patch.status;
  u.initials = initials(patch.name);
  return delay({ ...u });
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

// BE thật: shape AdminFailedPostResponse (GET /admin/posts/failed).
interface BeFailedPost {
  id: string;
  platformName: 'FACEBOOK' | 'INSTAGRAM' | 'THREADS';
  accountName: string | null;
  ownerEmail: string | null;
  caption: string | null;
  errorType: 'TEMPORARY' | 'PERMANENT' | 'POLICY_VIOLATION' | null;
  errorCode: string | null;
  errorMessage: string | null;
  failedAt: string | null;
}

const BE_PLATFORM_TAG: Record<BeFailedPost['platformName'], 'FB' | 'IG' | 'TH'> =
  { FACEBOOK: 'FB', INSTAGRAM: 'IG', THREADS: 'TH' };

// GET /admin/posts/failed (ADMIN, FR-82/FR-83) — vi phạm chính sách = 'rejected', còn lại 'system'.
export async function getPostProblems(lang: Lang): Promise<AdminPostProblem[]> {
  const { data } = await client.get<ApiResponse<PageResponse<BeFailedPost>>>('/admin/posts/failed', {
    params: { size: 50 },
  });
  return data.result.content.map((p) => ({
    id: p.id,
    user: p.ownerEmail ?? '—',
    platform: BE_PLATFORM_TAG[p.platformName] ?? 'FB',
    kind: p.errorType === 'POLICY_VIOLATION' ? 'rejected' : 'system',
    reason: p.errorType === 'POLICY_VIOLATION'
      ? P(lang, 'Nền tảng từ chối do vi phạm chính sách', 'Rejected by the platform for policy violation')
      : p.errorType === 'TEMPORARY'
        ? P(lang, 'Lỗi tạm thời — đã hết lượt thử lại', 'Temporary error — retries exhausted')
        : P(lang, 'Lỗi đăng bài vĩnh viễn', 'Permanent publishing error'),
    platformError: `${p.errorCode ?? '—'}: ${p.errorMessage ?? ''}`.trim(),
    content: p.caption ?? '',
    date: beDateTime(p.failedAt) ?? '—',
  }));
}

// ===== Trạng thái hệ thống (FR-81) — GET /admin/system/status =====
export type ServiceStatus = 'operational' | 'degraded' | 'down';
export interface SystemStatus {
  services: { name: string; status: ServiceStatus; uptime: string }[];
  load: number[]; // % tải 24 mốc (mỗi giờ)
  alerts: { id: string; tone: Tone; level: string; message: string; time: string }[];
}

// BE thật: shape AdminSystemStatusResponse (GET /admin/system).
interface BeSystemStatus {
  services: { name: string; status: 'UP' | 'DOWN'; detail: string | null }[];
  totalUsers: number;
  activeConnections: number;
  postedLast24h: number;
  failedLast24h: number;
  pendingSchedules: number;
  alerts: { id: string; level: LogLevel; module: string; message: string; createdAt: string }[];
}

const SERVICE_LABEL = (lang: Lang): Record<string, string> => ({
  database: P(lang, 'Cơ sở dữ liệu (PostgreSQL)', 'Database (PostgreSQL)'),
  redis: 'Redis',
  aiService: P(lang, 'Bộ máy AI (AI service)', 'AI engine (AI service)'),
});

// GET /admin/system (ADMIN, FR-81). BE không đo % tải theo giờ → `load` trả rỗng
// (trang System ẩn chart khi không có dữ liệu); các counter vận hành đưa vào alerts dạng INFO.
export async function getSystemStatus(lang: Lang): Promise<SystemStatus> {
  const { data } = await client.get<ApiResponse<BeSystemStatus>>('/admin/system');
  const s = data.result;
  const counters = P(lang,
    `${s.totalUsers} người dùng · ${s.activeConnections} kết nối ACTIVE · 24h qua: ${s.postedLast24h} bài đăng thành công, ${s.failedLast24h} thất bại · ${s.pendingSchedules} lịch đang chờ`,
    `${s.totalUsers} users · ${s.activeConnections} ACTIVE connections · last 24h: ${s.postedLast24h} posts published, ${s.failedLast24h} failed · ${s.pendingSchedules} schedules pending`);
  return {
    services: s.services.map((sv) => ({
      name: SERVICE_LABEL(lang)[sv.name] ?? sv.name,
      status: sv.status === 'UP' ? 'operational' : 'down',
      uptime: sv.status === 'UP' ? P(lang, 'Hoạt động', 'Operational') : (sv.detail ?? 'DOWN'),
    })),
    load: [],
    alerts: [
      { id: 'counters', tone: 'info', level: 'INFO', message: counters, time: '' },
      ...s.alerts.map((a) => ({
        id: a.id, tone: logLevelTone(a.level), level: a.level,
        message: `[${a.module}] ${a.message}`, time: beDateTime(a.createdAt) ?? '',
      })),
    ],
  };
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

// GET /admin/logs (ADMIN, FR-84) — nguồn: bảng system_logs (FR-74); trang Logs lọc
// level/ngày client-side trên trang mới nhất.
export async function getSystemLogs(): Promise<SystemLog[]> {
  const { data } = await client.get<ApiResponse<PageResponse<{
    id: string; level: LogLevel; module: string; message: string; detail: string | null; createdAt: string;
  }>>>('/admin/logs', { params: { size: 100 } });
  return data.result.content.map((l) => ({
    id: l.id,
    time: (l.createdAt ?? '').slice(0, 19).replace('T', ' '),
    level: l.level,
    module: l.module,
    message: l.message,
  }));
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
    { id: 'INV-0612', customer: 'David Chen', plan: 'Plus', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-22' },
    { id: 'INV-0611', customer: 'Sophie Tran', plan: 'Pro', amount: 1_990_000, tone: 'success' as Tone, status: paid, date: '2026-06-22' },
    { id: 'INV-0610', customer: 'Mai Chi', plan: 'Plus', amount: 499_000, tone: 'warning' as Tone, status: pending, date: '2026-06-21' },
    { id: 'INV-0609', customer: 'Hoàng Long', plan: 'Plus', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-21' },
    { id: 'INV-0608', customer: 'Quang Huy', plan: 'Pro', amount: 1_990_000, tone: 'danger' as Tone, status: refunded, date: '2026-06-20' },
    { id: 'INV-0607', customer: 'Diệu Linh', plan: 'Plus', amount: 499_000, tone: 'success' as Tone, status: paid, date: '2026-06-20' },
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
    { id: 'plus', name: 'Plus', price: 499_000, active: true },
    { id: 'pro', name: 'Pro', price: 1_990_000, active: true },
  ]);
}

// TODO(backend): PUT /admin/plans/{id} & POST /admin/plans — hiện chỉ trả lại payload.
export async function savePlan(plan: PricingPlan): Promise<PricingPlan> {
  return delay(plan);
}
