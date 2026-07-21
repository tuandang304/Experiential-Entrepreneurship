package com.aima.repository.projection;

/**
 * Số liệu gộp của MỘT nền tảng trong kỳ (khối D — "Hiệu suất theo nền tảng").
 * {@code engagement} = likes + comments + shares (tính sẵn ở SQL). Mỗi bài chỉ góp một snapshot
 * mốc muộn nhất để không đếm trùng số cộng dồn.
 */
public interface PlatformMetricProjection {

    String getPlatform();

    long getViews();

    long getLikes();

    long getComments();

    long getShares();

    long getEngagement();
}
