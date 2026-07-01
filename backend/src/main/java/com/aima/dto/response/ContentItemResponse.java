package com.aima.dto.response;

import com.aima.enums.ContentLifecycle;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentItemResponse", description = "AI-generated content item (FR-24..FR-30).")
public class ContentItemResponse {

    @Schema(description = "Unique content item identifier.")
    UUID id;

    @Schema(description = "Video script (hook, main content, shot suggestions, CTA) as newline-separated lines.")
    String script;

    @Schema(description = "Generated caption (FR-26).")
    String caption;

    @Schema(description = "Generated hashtags (FR-27), without a leading '#'.")
    List<String> hashtags;

    @Schema(description = "Generated call-to-action (FR-28).")
    String cta;

    @Schema(description = "Text description of the image/video to create (FR-29) — no media is generated.")
    String mediaPrompt;

    @Schema(description = "Content lifecycle status.", example = "GENERATED")
    ContentLifecycle status;
}
