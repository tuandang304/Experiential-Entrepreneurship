import type { PageResponse } from './api/apiClient.ts';
import type { FailedPost, FailedPostFilter, FailedPostSummary } from './api/failedPosts.ts';

// Mock demo cho trang "Bài lỗi & cần xử lý" — dùng khi backend chưa chạy / user chưa có bài lỗi
// (cùng vai trò với trendsData.ts của trang Trends). Dữ liệu thật luôn được ưu tiên.
// Mã lỗi lấy theo Graph API thật: 368 (vi phạm chuẩn cộng đồng), 190 (token hết hạn),
// 4 (rate limit), 100 (sai tham số/media), 2 (lỗi tạm thời phía nền tảng).

const MOCK_FAILED_POSTS: FailedPost[] = [
  {
    id: 'mock-1',
    scheduleId: 'mock-sch-1',
    contentItemId: 'mock-ci-1',
    platformName: 'FACEBOOK',
    accountName: 'AIMA Coffee House',
    caption: 'Giảm 50% toàn bộ menu — nhanh tay kẻo lỡ! Cam kết rẻ nhất thị trường, không đâu bằng.',
    errorType: 'POLICY_VIOLATION',
    errorCode: '368',
    errorMessage: 'Nội dung vi phạm Tiêu chuẩn cộng đồng: quảng cáo phóng đại, tuyên bố tuyệt đối chưa được kiểm chứng.',
    failedAt: '2026-07-13T09:24:00',
  },
  {
    id: 'mock-2',
    scheduleId: 'mock-sch-2',
    contentItemId: 'mock-ci-2',
    platformName: 'INSTAGRAM',
    accountName: '@aima.coffee',
    caption: 'Bí quyết pha cold brew tại nhà chỉ với 3 bước đơn giản ☕',
    errorType: 'PERMANENT',
    errorCode: '190',
    errorMessage: 'Access token đã hết hạn. Hãy kết nối lại tài khoản Instagram để tiếp tục đăng bài.',
    failedAt: '2026-07-13T07:10:00',
  },
  {
    id: 'mock-3',
    scheduleId: 'mock-sch-3',
    contentItemId: 'mock-ci-3',
    platformName: 'THREADS',
    accountName: '@aima.coffee',
    caption: 'Bạn thuộc team cà phê sữa hay team cà phê đen? Comment cho mình biết nhé!',
    errorType: 'TEMPORARY',
    errorCode: '4',
    errorMessage: 'Vượt giới hạn số lần gọi API của nền tảng. Đã thử lại 3 lần nhưng chưa thành công.',
    failedAt: '2026-07-12T20:45:00',
  },
  {
    id: 'mock-4',
    scheduleId: 'mock-sch-4',
    contentItemId: 'mock-ci-4',
    platformName: 'FACEBOOK',
    accountName: 'AIMA Coffee House',
    caption: 'Ảnh hậu trường buổi chụp menu mùa hè 2026 📸',
    errorType: 'PERMANENT',
    errorCode: '100',
    errorMessage: 'Định dạng media không hợp lệ: ảnh vượt quá 8MB hoặc tỷ lệ khung hình không được hỗ trợ.',
    failedAt: '2026-07-12T14:02:00',
  },
  {
    id: 'mock-5',
    scheduleId: 'mock-sch-5',
    contentItemId: 'mock-ci-5',
    platformName: 'INSTAGRAM',
    accountName: '@aima.coffee',
    caption: 'Uống cà phê AIMA mỗi ngày giúp giảm cân và chữa mất ngủ hiệu quả.',
    errorType: 'POLICY_VIOLATION',
    errorCode: '368',
    errorMessage: 'Nội dung vi phạm chính sách quảng cáo y tế: tuyên bố công dụng sức khỏe không có căn cứ.',
    failedAt: '2026-07-11T16:30:00',
  },
  {
    id: 'mock-6',
    scheduleId: 'mock-sch-6',
    contentItemId: null,
    platformName: 'THREADS',
    accountName: '@aima.coffee',
    caption: null,
    errorType: 'TEMPORARY',
    errorCode: '2',
    errorMessage: 'Nền tảng tạm thời không phản hồi (timeout). Bài sẽ được thử lại theo lịch retry.',
    failedAt: '2026-07-11T08:15:00',
  },
  {
    id: 'mock-7',
    scheduleId: 'mock-sch-7',
    contentItemId: 'mock-ci-7',
    platformName: 'FACEBOOK',
    accountName: 'AIMA Coffee House',
    caption: 'Săn deal cuối tuần: mua 1 tặng 1 cho mọi loại trà trái cây 🍊',
    errorType: 'PERMANENT',
    errorCode: '190',
    errorMessage: 'Trang Facebook đã thu hồi quyền đăng bài của ứng dụng. Cần cấp lại quyền khi kết nối.',
    failedAt: '2026-07-10T11:48:00',
  },
];

const matches = (p: FailedPost, filter: FailedPostFilter) =>
  filter === 'ALL' ||
  (filter === 'POLICY' ? p.errorType === 'POLICY_VIOLATION' : p.errorType !== 'POLICY_VIOLATION');

/** Cắt trang y như backend (page đánh số từ 0) để nút "Xem thêm" hoạt động trên mock. */
export function mockFailedPostPage(filter: FailedPostFilter, page: number, size: number): PageResponse<FailedPost> {
  const all = MOCK_FAILED_POSTS.filter((p) => matches(p, filter));
  const content = all.slice(page * size, page * size + size);
  const totalPages = Math.max(1, Math.ceil(all.length / size));
  return { content, page, size, totalElements: all.length, totalPages, last: page >= totalPages - 1 };
}

export function mockFailedPostSummary(): FailedPostSummary {
  const policyViolation = MOCK_FAILED_POSTS.filter((p) => p.errorType === 'POLICY_VIOLATION').length;
  return { total: MOCK_FAILED_POSTS.length, policyViolation, technical: MOCK_FAILED_POSTS.length - policyViolation };
}
