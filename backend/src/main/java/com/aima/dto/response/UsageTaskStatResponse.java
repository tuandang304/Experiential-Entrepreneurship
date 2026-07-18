package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/** Một dòng "Top tính năng" ở tab Tổng quan (gộp từ rollup, token thô). */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageTaskStatResponse {

    String taskCode;

    Long totalTokens;

    Long requests;

    Long errors;

    BigDecimal costUsd;
}
