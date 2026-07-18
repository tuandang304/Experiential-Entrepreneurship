package com.aima.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

/** Một dòng "Top 10 user tiêu thụ nhiều nhất" ở tab Tổng quan. */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UsageTopUserResponse {

    UUID userId;

    String email;

    String fullName;

    String avatarUrl;

    Long totalTokens;

    BigDecimal costUsd;
}
