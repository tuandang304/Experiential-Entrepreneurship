package com.aima.enums;

/**
 * Trạng thái gói đăng ký ({@code subscriptions}). Pha hiện tại chỉ dùng ACTIVE —
 * PENDING/CANCELLED/EXPIRED dành cho luồng thanh toán (pha sau, payment chỉ stub).
 */
public enum SubscriptionStatus {
    ACTIVE,
    PENDING,
    CANCELLED,
    EXPIRED
}
