package com.aima.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Mirrors ai/src/schemas.py GenerateRequest — sent as the body of POST {ai-service}/generate.
 * trend/idea are omitted (Trend Research is not built yet); the Python side treats them as
 * Optional and defaults to None when absent.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateContentPayload {

    @JsonProperty("brand_profile")
    BrandProfileInputPayload brandProfile;

    ContentStrategyInputPayload strategy;

    String platform;

    String topic;

    @JsonProperty("regenerate_from")
    String regenerateFrom;
}
