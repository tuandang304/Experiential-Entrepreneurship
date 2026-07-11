package com.aima.dto.ai;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Mirrors ai/src/schemas.py RegeneratePartResult — CHỈ chứa phần vừa tạo lại:
 * {@code section} cho HOOK/CTA, {@code steps} cho BODY. Nhánh không được yêu cầu để null.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegeneratePartResultPayload {

    /** Dùng khi tạo lại HOOK/CTA — chỉ field được yêu cầu (content(+timing) hoặc scene_suggestion) có giá trị. */
    ScriptSectionPayload section;

    /** Dùng khi tạo lại BODY — mỗi bước chỉ mang field được yêu cầu. */
    List<ScriptStepPayload> steps;
}
