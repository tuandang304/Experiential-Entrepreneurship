// Design tokens cho màu trạng thái kết nối — MỘT nguồn duy nhất, dùng chung giữa
// badge trong bảng "Danh sách tài khoản đã kết nối" và phần "Chú thích trạng thái".
// Mỗi token gồm: color (chữ/icon), bg (nền badge), dot (chấm tròn legend).
// Không hardcode hex rải rác — mọi nơi cần màu trạng thái import từ đây.

export type StatusToken = 'active' | 'expired' | 'error' | 'info';

export const STATUS_COLORS: Record<StatusToken, { color: string; bg: string }> = {
  active: { color: '#16a34a', bg: '#dcfce7' }, // Đang hoạt động / Còn hiệu lực
  expired: { color: '#c2410c', bg: '#ffedd5' }, // Hết hạn
  error: { color: '#dc2626', bg: '#fee2e2' }, // Lỗi kết nối
  info: { color: '#7c3aed', bg: '#f1e9ff' }, // Thông tin / primary (kiểm tra trước khi đăng)
};

// Trạng thái phụ (chưa kết nối / chờ xử lý) — giữ để map đầy đủ ConnectionStatus của backend.
export const STATUS_NEUTRAL = { color: '#6b7280', bg: '#f3f4f6' };
export const STATUS_PENDING = { color: '#d97706', bg: '#fef3c7' };
