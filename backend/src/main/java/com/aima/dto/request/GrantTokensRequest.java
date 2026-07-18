package com.aima.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Admin cấp thêm token cho user trong kỳ hiện tại (ghi usage_adjustments GRANT). */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GrantTokensRequest {

    @NotNull(message = "USAGE_ADJUSTMENT_INVALID")
    @Positive(message = "USAGE_ADJUSTMENT_INVALID")
    Long tokens;

    String reason;
}
