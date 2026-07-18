package com.aima.enums;

/**
 * Loại điều chỉnh usage token ({@code usage_adjustments}):
 * GRANT = cấp thêm token trong kỳ (trừ vào mức dùng hiệu lực);
 * RESET = đặt lại mức dùng của kỳ về 0 kể từ thời điểm bản ghi (mốc baseline).
 */
public enum UsageAdjustmentType {
    GRANT,
    RESET
}
