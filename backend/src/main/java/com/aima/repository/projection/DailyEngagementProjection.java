package com.aima.repository.projection;

/**
 * Một ngày của biểu đồ Phân tích: 4 metric (views/likes/comments/shares) cộng dồn theo NGÀY ĐĂNG.
 *
 * <p>{@code day} là chuỗi {@code yyyy-MM-dd}. Mỗi bài chỉ góp MỘT snapshot (mốc giờ lớn nhất) —
 * {@code post_analytics} lưu số liệu cộng dồn ở các mốc 24h/48h/168h nên cộng cả ba sẽ đếm trùng.
 * Metric nền tảng không cung cấp (vd Facebook thiếu {@code read_insights} → views) được coi là 0.
 */
public interface DailyEngagementProjection {

    String getDay();

    long getViews();

    long getLikes();

    long getComments();

    long getShares();
}
