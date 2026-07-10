package com.aima.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một bước đánh số trong thân bài của kịch bản video ("Bước 1", "Bước 2"...) —
 * nội dung và gợi ý cảnh quay tách riêng (FR-25).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ScriptStep", description = "One numbered step of the video body.")
public class ScriptStepDto {

    @Schema(description = "1-based step number.")
    Integer index;

    @Schema(description = "What the creator says/shows on camera in this step.")
    String content;

    @Schema(description = "Concrete filming direction for this step (framing, b-roll, transition).")
    String sceneSuggestion;
}
