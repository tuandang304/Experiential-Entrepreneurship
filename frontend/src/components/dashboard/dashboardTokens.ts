/**
 * Màu cho các chart của Bảng điều khiển. Phải là mã màu rời (không dùng `brandGradient` của theme)
 * vì SVG cần từng stop tường minh, còn brandGradient là chuỗi CSS.
 *
 * GRID_LINE / AXIS_TEXT cố ý trùng giá trị với `components/admin/revenue/chartTokens.ts` để lưới
 * và nhãn trục toàn site giống nhau; hai khu vực giữ token riêng thay vì import chéo nhau.
 */

/** Hai đường của biểu đồ hiệu suất — tím (tiếp cận) và xanh (tương tác), lấy từ dải thương hiệu. */
export const REACH_LINE = '#8b5cf6';
export const ENGAGEMENT_LINE = '#46d6ec';

export const GRID_LINE = '#f1eef8';
export const AXIS_TEXT = '#a59fbb';

/** Bảng màu donut "Loại nội dung" — gán theo thứ tự lát, không theo tên định dạng, để định dạng
 *  mới (REEL, STORY…) tự có màu mà không phải sửa code. */
const TYPE_PALETTE = ['#8b5cf6', '#46d6ec', '#f083c0', '#10b981', '#f59e0b', '#6366f1'];

export const typeColor = (index: number) => TYPE_PALETTE[index % TYPE_PALETTE.length];

/** Tone của 4 thẻ số liệu — nền/màu icon; sparkline dùng `stroke`. */
export const STAT_TONES = {
  violet: { bg: '#f1e9ff', color: '#7c3aed', stroke: '#8b5cf6' },
  emerald: { bg: '#e8f8ee', color: '#16a34a', stroke: '#10b981' },
  amber: { bg: '#fdf4e5', color: '#d97706', stroke: '#f59e0b' },
  rose: { bg: '#fdecf1', color: '#e23d6e', stroke: '#f43f5e' },
} as const;

export type StatTone = keyof typeof STAT_TONES;
