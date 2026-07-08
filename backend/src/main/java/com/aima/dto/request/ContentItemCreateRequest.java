package com.aima.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * B2: tạo BÀI (ContentItem shell, DRAFT) trước khi bắn các job generate — mỗi nền tảng
 * một job ghi ContentVersion vào bài này. Trend/note đi theo từng job, không lưu ở đây.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentItemCreateRequest", description = "Create one content item shell to receive per-platform versions.")
public class ContentItemCreateRequest {

    @NotNull(message = "STRATEGY_ID_REQUIRED")
    @Schema(description = "Content strategy id; must be ACTIVE and owned by the caller (BR-01, BR-03).",
            requiredMode = Schema.RequiredMode.REQUIRED)
    UUID strategyId;

    @Schema(description = "Content idea this item derives from (optional); unknown/foreign ids are ignored.")
    UUID ideaId;
}
