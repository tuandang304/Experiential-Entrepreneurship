package com.aima.enums;

/**
 * Nguồn phát sinh điều chỉnh usage token: ADMIN_GRANT = admin cấp/reset thủ công;
 * PURCHASE = user mua thêm token (đi kèm payment_id — luồng thanh toán pha sau);
 * PROMO = khuyến mãi. Thiết kế sẵn để "mua thêm token" chỉ là một adjustment,
 * không cần migration lại.
 */
public enum UsageAdjustmentSource {
    ADMIN_GRANT,
    PURCHASE,
    PROMO
}
