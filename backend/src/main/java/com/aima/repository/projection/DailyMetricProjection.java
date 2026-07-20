package com.aima.repository.projection;

/**
 * Một điểm của biểu đồ "Hiệu suất nội dung": lượt tiếp cận + lượt tương tác cộng dồn theo NGÀY ĐĂNG.
 *
 * <p>{@code day} là chuỗi {@code yyyy-MM-dd}. Mỗi bài chỉ góp MỘT snapshot (mốc giờ lớn nhất) —
 * {@code post_analytics} lưu số liệu cộng dồn ở các mốc 24h/48h/168h nên cộng cả ba sẽ đếm trùng.
 */
public interface DailyMetricProjection {

    String getDay();

    long getReach();

    long getEngagement();
}
