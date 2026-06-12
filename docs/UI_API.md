# UI_API.md — UI, API, Security, Integration (AIMA)

---

## Yêu cầu giao diện (UI)

| Mã | Trang | Nội dung |
|----|-------|----------|
| UI-01 | Landing Page | Hero, vấn đề người dùng, giải pháp AIMA, chức năng chính, quy trình, lợi ích, CTA đăng ký/dùng thử |
| UI-02 | Dashboard | Số bài đã tạo / lên lịch / đã đăng / thất bại; hiệu quả tổng quan; insight mới; thanh tiến trình setup (FR-86) |
| UI-03 | Brand Profile | Tạo/sửa hồ sơ thương hiệu |
| UI-04 | Content Strategy | Mục tiêu, tần suất, nền tảng, lịch đăng |
| UI-05 | Trend Research | Danh sách trend + content idea do AI đề xuất |
| UI-06 | Content Workspace | Xem/sửa/duyệt/regenerate nội dung |
| UI-07 | Calendar / Schedule | Lịch đăng theo ngày/tuần/tháng |
| UI-08 | Analytics | Dữ liệu hiệu quả + insight |
| UI-09 | Social Account | Kết nối / trạng thái / ngắt kết nối |
| UI-10 | Admin Dashboard | User, lỗi hệ thống, nội dung cần duyệt |

**Nguyên tắc UI/UX**: đơn giản dễ dùng cho người không kỹ thuật; responsive (desktop/laptop/tablet); thiết kế nhất quán, hiện đại; **minh bạch AI** — đánh dấu rõ nội dung nào do AI tạo / cần duyệt / đã auto-post.

---

## API

- **API-01** Response thống nhất:
  ```json
  { "code": 200, "message": "Success", "result": {} }
  ```
- **API-02** Mọi API dữ liệu user phải xác thực.
- **API-03** Kiểm tra quyền: user chỉ truy cập dữ liệu của mình; admin có quyền quản trị.
- **API-04** Validate input trước khi xử lý.
- **API-05** Trả lỗi rõ ràng, message dễ hiểu cho frontend.

---

## Bảo mật (Security)

| Mã | Yêu cầu |
|----|---------|
| SEC-01 | Mật khẩu mã hóa, không lưu plain text |
| SEC-02 | Token xác thực bảo vệ API |
| SEC-03 | Access/Refresh token MXH lưu an toàn, không lộ ra frontend |
| SEC-04 | Phân quyền User / Admin rõ ràng |
| SEC-05 | User không truy cập dữ liệu user khác |
| SEC-06 | **Không tự build bộ lọc nội dung riêng** — chỉ xử lý đúng khi platform từ chối; ghi nhận lỗi rõ ràng, không retry loại lỗi vi phạm |

---

## Tích hợp (Integration)

| Mã | Tích hợp | Ghi chú |
|----|----------|---------|
| INT-01 | Facebook | Kết nối, đăng bài, lấy analytics (nếu API cho phép) |
| INT-02 | Instagram | Kết nối, đăng bài/Reels, analytics |
| INT-03 | Threads | Kết nối, đăng bài, analytics |
| INT-04 | AI Model | Research, generate, format, analyze, optimize |

> Thứ tự triển khai platform: **Facebook → Instagram → Threads**. Thiết kế lớp tích hợp dạng adapter/interface để dễ thêm platform mới sau này (NFR-09).

---

## Lưu ý kỹ thuật quan trọng

- **Async (NFR-04)**: research, generate, format, auto posting, analyze → background job + scheduler.
- **Scheduler**: kiểm tra lịch đăng, kích hoạt đúng giờ; chạy research định kỳ (2:00 AM).
- **Token refresh job** (FR-18a): tự refresh khi token còn < 24h.
- **Retry job** (FR-56): 3 lần, cách 5/15/30 phút, chỉ cho lỗi tạm thời.
- **Logging** (NFR-11): log lỗi AI, đăng bài, gọi API platform.
