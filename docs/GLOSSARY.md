# GLOSSARY.md — Thuật ngữ, Giả định, Ràng buộc (AIMA)

---

## Glossary

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Agent AI** | Tác nhân AI tự động: research, generate, format, analyze — không cần user can thiệp từng bước |
| **Brand Profile** | Hồ sơ thương hiệu: ngành hàng, giọng điệu, đối tượng, mục tiêu content. Nền tảng cho mọi nội dung AI tạo |
| **Brand Voice** | Giọng điệu thương hiệu (chuyên nghiệp, hài hước, trẻ trung, sang trọng...) |
| **CTA** | Call To Action — lời kêu gọi hành động (Mua ngay, Theo dõi, Bình luận để nhận tài liệu...) |
| **Content Strategy** | Chiến lược nội dung: mục tiêu, tần suất, nền tảng, phong cách |
| **ContentItem** | Nội dung gốc do AI tạo (script, caption, hashtag, CTA) trước khi format |
| **ContentVersion** | Phiên bản đã format theo từng platform cụ thể |
| **Giờ vàng** | Khung giờ tương tác cao nhất trên platform |
| **Hook** | Câu/cảnh mở đầu thu hút trong 1–3 giây đầu |
| **MVP** | Phiên bản tối thiểu đủ chức năng cốt lõi |
| **Posting Job** | Tiến trình gọi API platform để đăng bài, có thể retry |
| **Rate Limit** | Giới hạn số lần gọi API trong một khoảng thời gian |
| **Refresh Token** | Token lấy Access Token mới mà không cần đăng nhập lại |
| **Scheduler** | Thành phần kiểm tra lịch và kích hoạt đăng bài đúng giờ |
| **SME** | Small and Medium Enterprise — đối tượng khách hàng chính |
| **Soft Delete** | Xóa bằng cách đánh dấu `deleted_at`, không xóa hẳn |
| **Trend** | Xu hướng nội dung đang phổ biến (format, chủ đề, hashtag) |
| **Watch Time** | Tổng thời gian xem video — chỉ số chất lượng nội dung video |

---

## Giả định (Assumptions)

- **AS-01** User đã có tài khoản MXH hợp lệ để kết nối.
- **AS-02** Platform cung cấp API cần thiết cho đăng bài và lấy analytics.
- **AS-03** AI tạo nội dung dựa trên input của user.
- **AS-04** User chịu trách nhiệm cuối cùng với nội dung đăng lên tài khoản của họ.
- **AS-05** Một số platform giới hạn auto-posting → hệ thống xử lý theo khả năng API thực tế.

---

## Ràng buộc (Constraints)

- **CON-01** Phụ thuộc API của các platform MXH.
- **CON-02** Platform có thể đổi chính sách API, ảnh hưởng auto-posting.
- **CON-03** AI có thể tạo nội dung chưa chính xác → cần cơ chế review.
- **CON-04** Analytics có thể không realtime.
- **CON-05** Auto-posting phải tuân thủ chính sách từng platform.

---

## Nhắc lại phạm vi (cho Claude Code)

1. Platform: **Facebook → Instagram → Threads** (đúng thứ tự).
2. **Không** tự sinh ảnh/video — chỉ tạo media prompt (text).
3. **Không** tự build content filter — chỉ xử lý phản hồi vi phạm từ platform.
4. Tác vụ AI/posting luôn **async**.
5. **Soft delete** mặc định.
6. Tuân thủ **retry policy** (3 lần, 5/15/30 phút, chỉ lỗi tạm thời).
