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
 * Mirrors ai/src/schemas.py ContentItem — the body returned by POST {ai-service}/generate.
 * brand_voice_check (FR-30) is not persisted yet, so it's intentionally left off this mapping;
 * Jackson ignores the unrecognized JSON field by default.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GeneratedContentResult {

    VideoScriptPayload script;

    String caption;

    List<String> hashtags;

    String cta;

    @JsonProperty("media_prompt")
    String mediaPrompt;
}
