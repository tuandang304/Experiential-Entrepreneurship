package com.aima.dto.request;

import com.aima.enums.StrategyStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * FR-13: activate / pause a content strategy (DRAFT / ACTIVE / PAUSED).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "StrategyStatusRequest", description = "Payload for changing a content strategy's status.")
public class StrategyStatusRequest {

    @NotNull(message = "STRATEGY_STATUS_REQUIRED")
    @Schema(description = "New status.", example = "ACTIVE", requiredMode = Schema.RequiredMode.REQUIRED)
    StrategyStatus status;
}
