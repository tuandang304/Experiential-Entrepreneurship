package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Effective status toàn cụm cấu hình AI cho 3 trang admin. {@code fromDb=false} nghĩa là
 * toàn bộ cấu hình DB không hiệu lực (AI service chạy env) và usage KHÔNG được ghi.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiEffectiveStatusResponse {

    Boolean fromDb;

    /** Số route (đang bật) chỉ còn dự phòng chạy. */
    Integer degradedCount;

    /** Số route (đang bật) hỏng cả chính lẫn dự phòng. */
    Integer errorCount;

    List<AiRouteStatusResponse> routes;
}
