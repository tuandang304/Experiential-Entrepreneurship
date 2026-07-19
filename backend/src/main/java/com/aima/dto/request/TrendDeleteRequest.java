package com.aima.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

/**
 * Soft-deletes unwanted trends (multi-select on the "Trend nổi bật" tab).
 * Only trends belonging to the caller (via research session → brand profile) are deleted.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "TrendDeleteRequest", description = "Ids of the trends to soft-delete.")
public class TrendDeleteRequest {

    @NotEmpty(message = "TREND_IDS_REQUIRED")
    @Schema(description = "Trend ids to delete (at least one).")
    List<UUID> trendIds;
}
