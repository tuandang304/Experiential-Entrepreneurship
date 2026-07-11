package com.aima.dto.request;

import com.aima.enums.RegenField;
import com.aima.enums.RegenSection;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Yêu cầu tạo lại MỘT phần kịch bản của một ContentVersion (tạo lại độc lập, không đụng phần khác).
 * Request KHÔNG mang cả object script (tránh clobber phần user vừa sửa tay ở nhánh khác) — chỉ
 * xác định phần cần tạo lại; backend đọc script hiện tại của version làm ngữ cảnh & nền patch.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "RegeneratePartRequest", description = "Regenerate one part of a version's video script.")
public class RegeneratePartRequest {

    @NotNull(message = "REGEN_SECTION_REQUIRED")
    @Schema(description = "Which section to regenerate.", example = "HOOK")
    RegenSection section;

    @NotNull(message = "REGEN_FIELD_REQUIRED")
    @Schema(description = "Which branch: CONTENT (spoken text + timing) or SCENE (filming direction).", example = "CONTENT")
    RegenField field;

    @Schema(description = "Only for section=BODY: 1-based step to regenerate; null = all steps.")
    Integer stepIndex;
}
