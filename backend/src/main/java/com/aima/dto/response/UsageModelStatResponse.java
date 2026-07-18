package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/** Một dòng "Top model & provider" ở tab Tổng quan (theo token và cost_usd). */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageModelStatResponse {

    String providerCode;

    String modelCode;

    Long totalTokens;

    BigDecimal costUsd;
}
