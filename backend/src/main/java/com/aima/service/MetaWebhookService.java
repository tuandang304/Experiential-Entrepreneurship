package com.aima.service;

/**
 * Webhook Meta cho thông báo SAU khi đăng (bài bị gỡ/hạn chế do vi phạm — SEC-06, EX-02).
 * GET xác thực đăng ký (verify token); POST nhận sự kiện, đối chiếu chữ ký X-Hub-Signature-256.
 */
public interface MetaWebhookService {

    /** Trả lại hub.challenge khi mode=subscribe và verify token khớp; sai → WEBHOOK_VERIFY_FAILED. */
    String verify(String mode, String verifyToken, String challenge);

    /** Xử lý event: ghi log hệ thống; bài của mình bị gỡ → FAILED + notification cho chủ bài. */
    void handleEvent(String rawBody, String signature);
}
