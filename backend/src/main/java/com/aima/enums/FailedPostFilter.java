package com.aima.enums;

/**
 * Bộ lọc 3 tab của trang "Bài lỗi & cần xử lý" (FR-35..FR-39): cách xử lý khác nhau nên tách rõ.
 * POLICY = vi phạm chính sách (KHÔNG retry — phải sửa nội dung, BR-07); TECHNICAL = lỗi kỹ thuật
 * (retry / kết nối lại / dời giờ, FR-56/FR-72).
 */
public enum FailedPostFilter {
    ALL,
    POLICY,
    TECHNICAL
}
