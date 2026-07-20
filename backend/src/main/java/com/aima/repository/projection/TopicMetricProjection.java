package com.aima.repository.projection;

/**
 * Một dòng của khối "Top chủ đề hiệu quả": chủ đề (tên trend gắn với bài) kèm số bài đã dùng
 * và tổng lượt tương tác thu được. Xếp hạng ưu tiên tương tác, hòa thì xét số bài.
 */
public interface TopicMetricProjection {

    String getName();

    long getPosts();

    long getEngagement();
}
