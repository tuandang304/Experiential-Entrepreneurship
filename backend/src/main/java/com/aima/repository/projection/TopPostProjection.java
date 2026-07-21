package com.aima.repository.projection;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Một dòng "Top bài viết hiệu quả" (khối E): bài đã đăng kèm số liệu mốc muộn nhất.
 * {@code caption}/{@code contentItemId} lấy từ {@code content_versions} để FE hiển thị tiêu đề và
 * điều hướng sang chi tiết/Quản lý nội dung. MVP không có thumbnail (media chỉ là prompt text).
 */
public interface TopPostProjection {

    UUID getPostId();

    UUID getContentItemId();

    String getPlatform();

    String getCaption();

    String getAccountName();

    LocalDateTime getPublishedAt();

    long getViews();

    long getLikes();

    long getComments();

    long getShares();

    long getEngagement();
}
