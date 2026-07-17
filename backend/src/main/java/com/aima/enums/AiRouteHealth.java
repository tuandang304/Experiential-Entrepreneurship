package com.aima.enums;

/**
 * Sức khỏe hiệu lực của một dòng định tuyến AI (trang admin "Cấu hình AI"):
 * OK = model chính dùng được; DEGRADED = model chính hỏng nhưng dự phòng chạy được;
 * ERROR = cả chính lẫn dự phòng đều hỏng (runtime rơi về cấu hình env).
 */
public enum AiRouteHealth {
    OK,
    DEGRADED,
    ERROR
}
