package com.aima.repository.projection;

/**
 * Cặp nhãn/số lượng cho các biểu đồ phân bổ (hiện dùng cho donut "Loại nội dung").
 * {@code label} có thể null khi bản nền tảng chưa có định dạng — service quy về nhóm "khác".
 */
public interface LabelCountProjection {

    String getLabel();

    long getTotal();
}
