package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Mức dùng token LLM của user trong tháng hiện tại (thanh usage ở sidebar).
 * {@code limit} = Plan.monthlyTokenLimit của gói user; null = không giới hạn.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenUsageResponse {

    Long used;

    Long limit;

    String plan;
}
