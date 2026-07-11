package com.aima.dto.response;

import com.aima.enums.GenerationJobStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Trạng thái tác vụ tạo lại từng phần (NFR-04, FE poll tới SUCCESS/FAILED). {@code patch} chỉ có
 * khi SUCCESS — mang đúng phần vừa tạo lại để FE merge; version đã được backend patch in-place.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentRegenerationJobResponse", description = "Status of an async partial-regeneration job.")
public class ContentRegenerationJobResponse {

    @Schema(description = "Job id.")
    UUID id;

    @Schema(description = "Job status.", example = "PENDING")
    GenerationJobStatus status;

    @Schema(description = "Error message, present only when status is FAILED.")
    String errorMessage;

    @Schema(description = "The regenerated fragment, present only when status is SUCCESS.")
    ScriptPartPatch patch;
}
