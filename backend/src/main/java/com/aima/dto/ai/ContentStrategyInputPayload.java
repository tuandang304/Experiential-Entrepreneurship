package com.aima.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Mirrors ai/src/schemas.py ContentStrategyInput — field names map to its snake_case JSON.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContentStrategyInputPayload {

    List<String> goals;

    @JsonProperty("content_types")
    List<String> contentTypes;

    String frequency;

    List<String> platforms;

    String audience;

    @JsonProperty("content_style")
    String contentStyle;

    @JsonProperty("cta_type")
    String ctaType;
}
