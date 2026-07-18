package com.aima.service;

import com.aima.entity.Subscription;
import com.aima.entity.User;

/**
 * Gói đăng ký hiện hành của user ({@code subscriptions}) — nguồn sự thật về gói + chu kỳ
 * tính usage. {@code User.plan} chỉ là nhãn cache: admin đổi gói qua PATCH /users vẫn ghi
 * vào {@code User.plan}, subscription tự đồng bộ theo ở lần đọc kế tiếp (tới khi luồng
 * thanh toán pha sau đảo chiều nguồn sự thật).
 */
public interface SubscriptionService {

    /**
     * Subscription hiện hành của user: tự tạo nếu chưa có, tự lăn sang kỳ mới khi
     * {@code currentPeriodEnd} đã qua, tự đồng bộ plan khi {@code User.plan} đổi.
     * Trả null khi bảng plans chưa có gói của user (DB chưa seed) — caller rơi về
     * hạn mức/kỳ mặc định, không chặn luồng AI (cùng triết lý resolveLimit).
     * Gọi trong transaction đang mở (có thể ghi).
     */
    Subscription getOrCreate(User user);
}
