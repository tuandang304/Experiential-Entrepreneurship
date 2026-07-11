package com.aima.dto.response;

import com.aima.enums.RegenField;
import com.aima.enums.RegenSection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Fragment CHỈ chứa phần vừa tạo lại (không phải nguyên script) — FE dùng section/field để merge
 * đúng nhánh vào bản nháp cục bộ, giữ nguyên các chỉnh sửa tay ở phần khác.
 * - HOOK/CTA: {@code text} = nội dung mới (field=CONTENT) hoặc gợi ý cảnh quay mới (field=SCENE);
 *   {@code timing} chỉ có khi field=CONTENT.
 * - BODY: {@code steps} = danh sách bước đã tạo lại (mỗi phần tử index + text).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ScriptPartPatch", description = "Only the regenerated fragment of the script.")
public class ScriptPartPatch {

    RegenSection section;
    RegenField field;
    Integer stepIndex;

    /** HOOK/CTA: nội dung hoặc gợi ý cảnh quay mới (tùy field). */
    String text;
    /** HOOK/CTA + field=CONTENT: mốc thời gian mới (nếu AI đổi). */
    String timing;

    /** BODY: các bước đã tạo lại. */
    List<StepPatch> steps;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @Schema(name = "ScriptStepPatch", description = "One regenerated body step (content or scene).")
    public static class StepPatch {
        Integer index;
        String text;
    }
}
