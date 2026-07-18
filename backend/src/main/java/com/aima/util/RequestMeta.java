package com.aima.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Lấy IP/User-Agent của HTTP request hiện tại để CHỐT vào job AI lúc user tạo job —
 * cuộc gọi AI chạy trong worker nền (không còn request context) nên phải chụp tại đây
 * rồi copy sang event usage. Ngoài request context (scheduler/worker) → trả null.
 */
public final class RequestMeta {

    /** Khớp độ dài cột client_ip (IPv6 tối đa 45 ký tự). */
    static final int MAX_IP_LENGTH = 45;
    static final int MAX_UA_LENGTH = 300;

    private RequestMeta() {
    }

    /** IP client; sau proxy/CDN lấy phần tử ĐẦU của X-Forwarded-For, không thì IP kết nối. */
    public static String clientIp() {
        HttpServletRequest request = currentRequest();
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) {
                return truncate(first, MAX_IP_LENGTH);
            }
        }
        return truncate(request.getRemoteAddr(), MAX_IP_LENGTH);
    }

    public static String userAgent() {
        HttpServletRequest request = currentRequest();
        return request == null ? null : truncate(request.getHeader("User-Agent"), MAX_UA_LENGTH);
    }

    private static HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private static String truncate(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
