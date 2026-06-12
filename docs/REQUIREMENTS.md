# REQUIREMENTS.md — Functional Requirements (AIMA)

> Liệt kê FR theo nhóm chức năng. Dùng làm checklist khi implement.
> Platform scope hiện tại: **Facebook → Instagram → Threads** (theo thứ tự).

---

## 1. Quản lý tài khoản
- **FR-01 Register**: đăng ký bằng họ tên, email, mật khẩu, xác nhận mật khẩu.
- **FR-02 Login**: đăng nhập email + mật khẩu; sai → báo lỗi.
- **FR-03 Logout**.
- **FR-04 Profile**: xem/cập nhật thông tin cá nhân.

## 2. Brand Profile
- **FR-05 Create**: tên thương hiệu, ngành hàng, mô tả, brand voice, đối tượng mục tiêu, mục tiêu content, nền tảng, tần suất, khung giờ ưu tiên.
- **FR-06 Update**, **FR-07 View**, **FR-08 Delete**.
- **FR-09 Validate**: tên + ngành + đối tượng không trống; chọn ≥1 nền tảng; tần suất hợp lệ.

## 3. Content Strategy
- **FR-10 Create**: mục tiêu, loại nội dung, tần suất, nền tảng, khung giờ, đối tượng, phong cách, CTA mong muốn.
- **FR-11 Update**, **FR-12 List**.
- **FR-13 Activate/Pause**: khi pause → AI không tạo nội dung mới & không tự lên lịch cho strategy đó.

## 4. Kết nối mạng xã hội
- **FR-14 Connect**: Facebook → Instagram → Threads.
- **FR-15 List**: tên nền tảng, tên tài khoản, trạng thái kết nối, ngày kết nối, trạng thái token.
- **FR-16 Disconnect**, **FR-17 Check connection** trước khi đăng.
- **FR-18a** Tự refresh token khi còn hoạt động (token còn < 24h, có refresh token) → trạng thái vẫn Active.
- **FR-18b** Token hết hạn hoàn toàn → trạng thái `Expired`, báo user kết nối lại; bài `Scheduled` của nền tảng đó → `On Hold`.

## 5. Nghiên cứu xu hướng (Agent AI)
- **FR-19 Research**: tự động theo lịch (mặc định **2:00 AM mỗi ngày**) + nút "Research ngay". Chỉ chạy nếu có Brand Profile và Strategy đang `Active`. Không tạo phiên mới nếu phiên trước chưa xong.
- **FR-20 Filter theo ngành** (mỹ phẩm, giáo dục, thời trang, F&B, công nghệ, dịch vụ...).
- **FR-21 Đánh giá độ phù hợp**: Cao / Trung bình / Thấp.
- **FR-22 Tạo content idea** từ trend: tên trend, nền tảng phù hợp, độ phù hợp, mô tả, gợi ý triển khai, mục tiêu liên quan.
- **FR-23 Lưu research session**.

## 6. Tạo nội dung (Agent AI)
- **FR-24** Tạo nội dung từ brand profile + strategy + trend + idea + platform.
- **FR-25 Script video**: hook, nội dung chính, gợi ý cảnh quay, CTA.
- **FR-26 Caption**, **FR-27 Hashtag**, **FR-28 CTA**.
- **FR-29 Media prompt**: ⚠️ MVP chỉ tạo **text prompt mô tả** ảnh/video, KHÔNG tự sinh media.
- **FR-30** Kiểm tra brand voice.
- **FR-31** Lưu nháp (`Draft`/`Generated`).
- **FR-32 Regenerate**, **FR-33 Edit thủ công**, **FR-34 Review** trước khi đăng.

## 7. Xử lý vi phạm chính sách (KHÔNG tự build filter — SEC-06)
- **FR-35** Nhận response lỗi platform (HTTP 400/403 policy violation), phân loại là vi phạm chính sách, **không retry**, lưu mã lỗi + message gốc, chuyển `Failed`, báo user.
- **FR-36** Chuyển bài vi phạm sang `Failed` + lưu lỗi.
- **FR-37** Phân loại lỗi vi phạm vs lỗi kỹ thuật.
- **FR-38** Thông báo: nền tảng nào, lý do, bước tiếp theo.
- **FR-39** Cho phép sửa/regenerate rồi lên lịch lại.

## 8. Format theo nền tảng
- **FR-40** Tạo phiên bản riêng cho từng platform đã chọn.
- **FR-44 Facebook**: caption dài hơn, CTA rõ, dễ chia sẻ, kết hợp ảnh/video/link.
- **FR-42 Instagram**: video dọc/ảnh vuông-dọc, caption cảm xúc, hashtag thương hiệu, tính hình ảnh cao.
- **Threads**: (theo phạm vi hiện tại — format ngắn gọn, hội thoại; chi tiết bám API Threads).
- *(FR-41 TikTok, FR-43 YouTube Shorts, FR-45 LinkedIn — ngoài phạm vi hiện tại.)*
- **FR-46** Lưu từng `ContentVersion` đã format.

## 9. Lên lịch
- **FR-47 Create schedule**: nội dung, nền tảng, ngày, giờ, trạng thái.
- **FR-48 Gợi ý giờ vàng**: dựa trên nền tảng, đối tượng, dữ liệu cũ, khung giờ ưu tiên.
  - Khung giờ mặc định Facebook: 8h–9h, 13h–14h, 20h–21h. Instagram: 8h–10h, 12h–13h, 19h–21h.
  - Sau **≥10 bài có analytics** → chuyển sang gợi ý dựa trên dữ liệu thực.
- **FR-49 Queue**, **FR-50 Update lịch**, **FR-51 Cancel lịch** (bài chưa đăng).

## 10. Tự động đăng bài
- **FR-52** Đăng đúng giờ, **FR-53** gọi API platform, **FR-54** nhận kết quả.
- **FR-55** Lưu trạng thái (xem state machine ở CLAUDE.md).
- **FR-56 Retry policy**: chỉ retry lỗi tạm thời (timeout/rate limit/mạng), tối đa 3 lần (5/15/30 phút). Không retry lỗi vĩnh viễn.
- **FR-57** Thông báo khi thất bại; **FR-58** user xử lý (sửa nội dung/media/giờ/kết nối lại/đăng lại).

## 11. Phân tích hiệu quả
- **FR-59** Thu thập: views, likes, comments, shares, saves, CTR, conversion, watch time.
- **FR-60** Lưu DB, **FR-61** hiển thị cho user, **FR-62** so sánh các bài.
- **FR-63** Phân tích yếu tố thành công (hook, caption, hashtag, CTA, media, thời gian, nền tảng).
- **FR-64** Tạo insight tối ưu.

## 12. Tối ưu chiến lược
- **FR-65** Đề xuất điều chỉnh strategy dựa trên dữ liệu.
- **FR-66** Đề xuất cải thiện bài tương lai.
- **FR-67** Lưu lịch sử điều chỉnh.
- **FR-68** User chấp nhận/từ chối đề xuất.

## 13. Quản lý lỗi
- **FR-69** Phát hiện chưa kết nối MXH → chặn đăng + báo.
- **FR-70** Token hết hạn → `Failed` + yêu cầu kết nối lại/refresh.
- **FR-71** Media sai định dạng → báo + gợi ý sửa.
- **FR-72** API platform lỗi → ghi nhận + retry nếu phù hợp.
- **FR-73** Tài khoản bị giới hạn → dừng đăng + báo.
- **FR-74** Ghi log lỗi hệ thống.

## 14. Thông báo
- **FR-75** Đăng thành công, **FR-76** đăng thất bại, **FR-77** cần duyệt, **FR-78** cần kết nối lại, **FR-79** có insight mới.

## 15. Admin
- **FR-80** Quản lý user, **FR-81** trạng thái hệ thống, **FR-82** nội dung bị từ chối, **FR-83** lỗi đăng bài, **FR-84** log hệ thống.

## 16. Onboarding
- **FR-85 Wizard** (user mới): B1 Brand Profile (bắt buộc) → B2 kết nối ≥1 MXH → B3 Strategy đầu tiên → B4 tour nhanh (skip được). Có thể skip nhưng sẽ nhắc lại khi tạo content mà chưa có Brand Profile.
- **FR-86** Thanh tiến trình setup trên dashboard; ẩn khi hoàn tất.

## 17. Content Library
- **FR-87** Xem toàn bộ ContentItem (lọc theo trạng thái/nền tảng/ngày/ngành; tìm theo keyword trong caption/script).
- **FR-88** Tái sử dụng: regenerate từ item cũ → tạo item mới, không sửa gốc.
- **FR-89** Xóa: chỉ khi `Draft`/`Generated`; cấm xóa `Scheduled`/`Posting`/`Posted`; xóa item → xóa ContentVersion liên quan.

---

## Non-functional (tóm tắt)
Dễ dùng • responsive (desktop/laptop/tablet) • phản hồi nhanh • **xử lý AI async** • bảo mật tài khoản & token • phân quyền • toàn vẹn dữ liệu • mở rộng platform • dễ bảo trì (module hóa) • logging • retry • UI/UX nhất quán • minh bạch AI (đánh dấu nội dung do AI tạo / cần duyệt / đã auto-post) • an toàn nội dung.
