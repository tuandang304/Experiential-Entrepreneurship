package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Một điểm biểu đồ token theo ngày trong kỳ ({@code day} = ngày trong tháng, 1-based). */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageSeriesPointResponse {

    Integer day;

    Long totalTokens;
}
