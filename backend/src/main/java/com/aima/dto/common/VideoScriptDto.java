package com.aima.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Kịch bản video có cấu trúc (FR-25) — hợp đồng API dùng chung cho request/response.
 * Persist dưới dạng chuỗi JSON trong cột text `script` (xem {@link com.aima.util.ScriptJson});
 * mirror cấu trúc VideoScript của ai/src/schemas.py.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "VideoScript", description = "Structured video shooting script: timed hook, numbered body steps, timed closing CTA.")
public class VideoScriptDto {

    @Schema(description = "Attention-grabbing opening (first seconds of the video).")
    ScriptSectionDto hook;

    @Schema(description = "Body of the video as ordered, numbered steps.")
    List<ScriptStepDto> steps;

    @Schema(description = "Closing call-to-action at the end of the video.")
    ScriptSectionDto cta;
}
