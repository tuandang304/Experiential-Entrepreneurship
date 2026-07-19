package com.aima.dto.request;

import com.aima.enums.Platform;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Starts an async trend-research session ("Research now", FR-19). All fields optional:
 * the active brand profile and FACEBOOK are used as defaults.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "TrendResearchRequest", description = "Payload to start a trend-research session.")
public class TrendResearchRequest {

    @Schema(description = "Brand profile id; defaults to the caller's active brand profile.",
            example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID brandProfileId;

    @Schema(description = "Main platform of the session; defaults to FACEBOOK.")
    Platform platform;

    @Schema(description = "Content strategy id; defaults to the brand's latest ACTIVE strategy.",
            example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID strategyId;

    @Min(value = 1, message = "RESEARCH_ARTICLE_COUNT_INVALID")
    @Max(value = 20, message = "RESEARCH_ARTICLE_COUNT_INVALID")
    @Schema(description = "Desired number of content ideas (1-20); defaults to 10.", example = "10")
    Integer articleCount;
}
