package com.aima.dto.request;

import com.aima.enums.Platform;
import com.aima.enums.StrategyStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * FR-13 validation: a strategy belongs to a brand (brandId), must have a name,
 * at least one goal, one content type and one platform.
 * goals / contentTypes / styles / ctas are free-text (suggest + type-your-own),
 * stored verbatim — the entity keeps them as String collections, not enums.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentStrategyRequest", description = "Payload for creating or updating a content strategy.")
public class ContentStrategyRequest {

    @NotNull(message = "BRAND_ID_REQUIRED")
    @Schema(description = "Owning brand profile id (BR-02).", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            requiredMode = Schema.RequiredMode.REQUIRED)
    UUID brandId;

    @NotBlank(message = "STRATEGY_NAME_REQUIRED")
    @Schema(description = "Strategy name.", example = "Tăng nhận diện thương hiệu",
            requiredMode = Schema.RequiredMode.REQUIRED)
    String name;

    @NotEmpty(message = "STRATEGY_GOAL_REQUIRED")
    @Schema(description = "Content goals (free text).", example = "[\"Tăng nhận diện thương hiệu\", \"Tăng tương tác\"]",
            requiredMode = Schema.RequiredMode.REQUIRED)
    List<String> goals;

    @NotEmpty(message = "STRATEGY_CONTENT_TYPE_REQUIRED")
    @Schema(description = "Preferred content types (free text).", example = "[\"Video ngắn\", \"Carousel\"]",
            requiredMode = Schema.RequiredMode.REQUIRED)
    List<String> contentTypes;

    @NotNull(message = "STRATEGY_FREQUENCY_COUNT_REQUIRED")
    @Schema(description = "Post frequency count.", example = "3", requiredMode = Schema.RequiredMode.REQUIRED)
    Integer frequencyCount;

    @Schema(description = "Post frequency unit (DAY, WEEK, MONTH, YEAR).", example = "WEEK")
    String frequencyUnit;

    @NotEmpty(message = "PLATFORM_REQUIRED")
    @Schema(description = "Platforms to publish on.", requiredMode = Schema.RequiredMode.REQUIRED)
    Set<Platform> platforms;

    @Schema(description = "Preferred posting time slots (free text).", example = "[\"07:00-09:00\", \"19:00-22:00\"]")
    List<String> timeSlots;

    @Schema(description = "Target audiences (free text).", example = "[\"Gen Z\", \"Sinh viên\"]")
    List<String> audiences;

    @Schema(description = "Content styles (free text).", example = "[\"Trẻ trung\", \"Truyền cảm hứng\"]")
    List<String> styles;

    @Schema(description = "Desired CTAs (free text).", example = "[\"Tìm hiểu ngay\", \"Theo dõi kênh\"]")
    List<String> ctas;

    @Schema(description = "Strategy status; defaults to DRAFT when omitted on create.", example = "DRAFT")
    StrategyStatus status;
}
