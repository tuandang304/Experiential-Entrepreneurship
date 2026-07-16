import { getDict } from '../../i18n.ts';
import { TONE_COLORS } from '../../statusTokens.ts';
import type { FailedPost } from '../../api/failedPosts.ts';
import type { Platform } from '../../api/brandProfile.ts';

// Helper dùng chung cho cụm component trang "Bài lỗi & cần xử lý" (master–detail).
// Màu loại lỗi lấy từ TONE_COLORS (đỏ = vi phạm CS, cam = lỗi kỹ thuật) — không hardcode rời.

export type FpDict = ReturnType<typeof getDict>;

export const isPolicy = (p: FailedPost) => p.errorType === 'POLICY_VIOLATION';

/** Tone màu theo loại lỗi: danger (vi phạm CS) / warning (lỗi kỹ thuật). */
export const toneOf = (p: FailedPost) => TONE_COLORS[isPolicy(p) ? 'danger' : 'warning'];

export const typeLabel = (p: FailedPost, t: FpDict) => (isPolicy(p) ? t.fpBadgePolicy : t.fpBadgeTech);

export const fmtDate = (iso: string | null) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');
export const fmtTime = (iso: string | null) => (iso ? iso.slice(11, 16) : '');

/** Bộ lọc phụ dưới hàng tab (nền tảng / khoảng ngày / trạng thái). */
export interface FpFilters {
  platform: 'ALL' | Platform;
  status: 'ALL' | 'FAILED';
  /** yyyy-MM-dd hoặc '' (không lọc). */
  from: string;
  to: string;
}

export const EMPTY_FILTERS: FpFilters = { platform: 'ALL', status: 'ALL', from: '', to: '' };

export const countActiveFilters = (f: FpFilters) =>
  (f.platform !== 'ALL' ? 1 : 0) + (f.status !== 'ALL' ? 1 : 0) + (f.from ? 1 : 0) + (f.to ? 1 : 0);

/** Chi tiết HTTP hiển thị trong panel — suy từ mã lỗi Graph API (type FailedPost không lưu HTTP status). */
const HTTP_BY_CODE: Record<string, string> = {
  '368': 'HTTP 400 · OAuthException',
  '190': 'HTTP 401 · OAuthException',
  '100': 'HTTP 400 · GraphMethodException',
  '4': 'HTTP 429 · ApplicationLimitReached',
  '2': 'HTTP 503 · TransientError',
};

export const httpDetailOf = (p: FailedPost) => (p.errorCode && HTTP_BY_CODE[p.errorCode]) || 'HTTP 400';

/** Mô tả ngắn cho các mã lỗi nền tảng thường gặp (khối "Mã lỗi vi phạm phổ biến"). */
export function codeLabel(code: string, t: FpDict): string {
  switch (code) {
    case '368': return t.fpCode368;
    case '190': return t.fpCode190;
    case '100': return t.fpCode100;
    case '4': return t.fpCode4;
    case '2': return t.fpCode2;
    default: return t.fpCodeOther;
  }
}
