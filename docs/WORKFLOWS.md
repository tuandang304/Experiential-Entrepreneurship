# WORKFLOWS.md — Use Cases & Business Flows (AIMA)

---

## Use Cases chính

| UC | Tên | Actor | Kết quả |
|----|-----|-------|---------|
| UC-01 | Configure Brand Persona | User | Brand profile được lưu |
| UC-02 | Define Content Strategy | User | Strategy lưu, AI dùng được |
| UC-03 | Connect Social Account | User | Tài khoản MXH liên kết |
| UC-04 | Research Trends | Agent AI | Danh sách trend + content idea |
| UC-05 | Generate Content | Agent AI | Nội dung nháp |
| UC-06 | Review Generated Content | User | Duyệt / regenerate |
| UC-07 | Format Content by Platform | Agent AI | ContentVersion theo platform |
| UC-08 | Schedule Post | Agent AI + User | Bài vào lịch |
| UC-09 | Auto Publish Post | Agent AI + Platforms | Posted hoặc Failed |
| UC-10 | Analyze Performance | Analytics + Agent AI | Insight |
| UC-11 | Optimize Future Strategy | Agent AI | Strategy cải thiện |
| UC-12 | Manage Failed Posts | User + Admin | Sửa/đăng lại/hủy |

---

## Business Flows (BF)

### BF01 — Brand Persona Setup
User mở cấu hình → nhập thông tin thương hiệu → chọn nền tảng → thiết lập tần suất/lịch → hệ thống validate → lưu → AI tạo hồ sơ thương hiệu nội bộ.

### BF02 — Strategy Configuration
Chọn mục tiêu → loại nội dung → nền tảng → tần suất → khung giờ → lưu strategy.

### BF03 — Content Generation
AI nhận brand profile + strategy + trend/idea → tạo script → caption → hashtag → CTA → media prompt → kiểm tra brand voice → lưu nháp.

### BF04 — Platform Formatting
Kiểm tra platform đã kết nối → lấy nội dung gốc → chỉnh caption/hashtag/media theo từng platform → tạo ContentVersion → lưu.

### BF05 — Schedule & Posting
Kiểm tra lịch → chọn bài → xác định giờ vàng → đưa vào queue → đến giờ gọi API platform → nhận kết quả → lưu trạng thái. Thành công → theo dõi analytics. Thất bại → ghi lỗi + báo.

### BF06 — Trend Research
Đến giờ chạy (hoặc thủ công) → thu thập trend từ platform → lọc theo ngành → đánh giá độ phù hợp → chọn trend tiềm năng → tạo content idea → lưu.

### BF07 — Performance Analysis
Sau đăng, đợi một khoảng → lấy dữ liệu tương tác → lưu analytics → AI so sánh bài → xác định bài tốt → phân tích yếu tố → tạo insight.

### BF08 — Strategy Optimization
AI lấy analytics + insight → xác định điểm cần cải thiện → đề xuất điều chỉnh → user chấp nhận/từ chối → nếu chấp nhận, cập nhật strategy.

### BF09 — Error Handling
Phát hiện lỗi → ghi log → bài sang `Failed` → nếu tạm thời thì retry → nếu cần user thì thông báo → user sửa/kết nối lại/đăng lại.

---

## Luồng ngoại lệ (Exceptions)

| EX | Tình huống | Xử lý |
|----|-----------|-------|
| EX-01 | Chưa kết nối MXH | Chặn đăng, hiển thị yêu cầu kết nối, sau khi kết nối thì tiếp tục |
| EX-02 | Nội dung vi phạm chính sách (HTTP 400/403) | `Failed`, **không retry**, lưu mã lỗi + message, báo user, cho phép sửa/regenerate rồi đăng lại |
| EX-03 | Đăng thất bại (token/API/media/account limit) | `Failed`, lưu lỗi; tạm thời → retry; không tự xử lý được → báo user |
| EX-04 | Nội dung không hợp brand | User regenerate (kèm ghi chú), lưu phiên bản mới |
| EX-05 | Không lấy được analytics | Ghi lỗi, thử lại sau; vẫn lỗi → báo "chưa khả dụng"; bài giữ `Posted` |

---

## State machine bài đăng

```
Bình thường:  Draft → Generated → Formatted → Scheduled → Posting → Posted → Analyzing → Optimized
Cần duyệt:    Generated → Need Review → Approved → Scheduled
Lỗi:          Posting → Failed → Retrying → Posted
Token hết hạn: Scheduled → On Hold (chờ user kết nối lại)
```

| Trạng thái | Ý nghĩa |
|-----------|---------|
| Draft | Bản nháp |
| Generated | AI đã tạo |
| Need Review | Cần duyệt |
| Approved | Đã duyệt |
| Formatted | Đã format theo platform |
| Scheduled | Đã lên lịch |
| Posting | Đang đăng |
| Posted | Đã đăng thành công |
| Failed | Thất bại |
| Retrying | Đang thử lại |
| Analyzing | Đang phân tích |
| Optimized | Đã dùng để tối ưu chiến lược |
