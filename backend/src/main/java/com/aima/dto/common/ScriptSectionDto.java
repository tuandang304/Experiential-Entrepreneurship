package com.aima.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một phần có mốc thời gian của kịch bản video (hook mở đầu hoặc CTA cuối) —
 * nội dung nói/diễn và gợi ý cảnh quay TÁCH RIÊNG (FR-25).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ScriptSection", description = "Timed section of the video script (hook or closing CTA).")
public class ScriptSectionDto {

    @Schema(description = "What the creator says/shows on camera in this section.")
    String content;

    @Schema(description = "Concrete filming direction for this section (framing, b-roll, transition).")
    String sceneSuggestion;

    @Schema(description = "Time range in the video, e.g. '0-3s' or '25-30s'.")
    String timing;
}
