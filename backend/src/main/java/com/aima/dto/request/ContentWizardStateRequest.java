package com.aima.dto.request;

import com.aima.enums.Platform;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

/**
 * Auto-save trạng thái wizard của một bài DRAFT (debounce phía FE) — để người dùng
 * "Tiếp tục" đúng bước đang dở từ danh sách, kể cả sau reload/đổi thiết bị.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentWizardStateRequest", description = "Wizard progress snapshot auto-saved on a DRAFT item.")
public class ContentWizardStateRequest {

    @NotNull(message = "CONTENT_WIZARD_STEP_INVALID")
    @Min(value = 1, message = "CONTENT_WIZARD_STEP_INVALID")
    @Max(value = 4, message = "CONTENT_WIZARD_STEP_INVALID")
    @Schema(description = "Wizard step the user is on (1-4).")
    Integer step;

    @Schema(description = "Platforms picked for this item.")
    List<Platform> platforms;

    @Schema(description = "Attached trend id (soft reference; resolved at generate time).")
    UUID trendId;

    @Schema(description = "Attached content-idea id (soft reference — unknown ids are ignored).")
    UUID ideaId;

    @Schema(description = "Extra user note for the AI, typed in the source step.")
    String note;
}
