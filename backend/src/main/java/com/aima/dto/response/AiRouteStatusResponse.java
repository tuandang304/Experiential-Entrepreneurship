package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Effective status của MỘT dòng định tuyến (nguồn sự thật duy nhất tính ở backend —
 * cùng luật với runtime resolve): OK = model chính chạy; DEGRADED = chỉ dự phòng chạy;
 * ERROR = cả hai hỏng. Route tắt (enabled=false) → health=null, FE hiển thị "dùng env".
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiRouteStatusResponse {

    UUID routingId;

    String taskCode;

    Boolean enabled;

    /** AiRouteHealth (OK/DEGRADED/ERROR); null khi route tắt — không tính vào counts. */
    String health;

    /** AiModelBlockReason của model chính; null = dùng được. */
    String primaryBlockReason;

    /** AiModelBlockReason của model dự phòng; null = dùng được HOẶC không có dự phòng. */
    String fallbackBlockReason;

    /** Phân biệt "không có dự phòng" với "dự phòng dùng được" (cùng fallbackBlockReason=null). */
    Boolean hasFallback;
}
