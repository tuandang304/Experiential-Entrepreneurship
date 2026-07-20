/**
 * Helper định dạng dùng chung. Tiền VND vẫn dùng `formatVND` sẵn có ở `api/admin.ts`
 * (một nguồn duy nhất, không viết lại) — file này chỉ bổ sung những thứ chưa có.
 */

/** Ngày kiểu Việt Nam: DD/MM/YYYY. Nhận ISO string hoặc Date; rỗng/null → '—'. */
export function formatDateVN(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Ngày + giờ: DD/MM/YYYY HH:mm. */
export function formatDateTimeVN(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${formatDateVN(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Số rút gọn cho trục Y / thẻ số liệu: 20M, 1.5B, 800K. Giữ tối đa 1 chữ số thập phân
 * và bỏ đuôi `.0` để nhãn trục không bị dài.
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const trim = (n: number) => String(+n.toFixed(1));
  if (abs >= 1_000_000_000) return `${trim(value / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(value / 1_000)}K`;
  return String(value);
}

/** Số tiền rút gọn cho trục Y của chart doanh thu — cùng quy tắc rút gọn với số thường. */
export function formatCompactVND(value: number): string {
  return formatCompactNumber(value);
}

/** Số nguyên đầy đủ có phân tách nghìn theo ngôn ngữ đang chọn (tooltip/tâm donut). */
export function formatGroupedNumber(value: number, lang: string): string {
  return value.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');
}

/** % có dấu để hiển thị mũi tên tăng/giảm. null (kỳ trước = 0) → '—'. */
export function formatDeltaPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value >= 0 ? '+' : ''}${value}%`;
}

/**
 * "x phút/giờ/ngày trước" — đủ dùng cho danh sách thông báo, không cần thư viện.
 * Dùng chung cho chuông thông báo và timeline hoạt động trên Bảng điều khiển.
 */
export function formatRelativeTime(
  iso: string,
  t: { ntfNow: string; ntfMinAgo: string; ntfHourAgo: string; ntfDayAgo: string }
): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t.ntfNow;
  if (minutes < 60) return t.ntfMinAgo.replace('{n}', String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.ntfHourAgo.replace('{n}', String(hours));
  const days = Math.floor(hours / 24);
  return t.ntfDayAgo.replace('{n}', String(days));
}
