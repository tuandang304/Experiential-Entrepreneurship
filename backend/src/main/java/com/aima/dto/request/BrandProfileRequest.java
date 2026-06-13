package com.aima.dto.request;

import com.aima.enums.Platform;
import com.aima.enums.PostingFrequency;
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

/**
 * FR-09 validation: brand name, industry and target audience must not be empty;
 * at least one platform; a valid posting frequency.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "BrandProfileRequest", description = "Payload for creating or updating a brand profile.")
public class BrandProfileRequest {

    @NotBlank(message = "BRAND_NAME_REQUIRED")
    @Schema(description = "Brand name.", example = "Aima Coffee", requiredMode = Schema.RequiredMode.REQUIRED)
    String brandName;

    @NotBlank(message = "INDUSTRY_REQUIRED")
    @Schema(description = "Industry the brand operates in.", example = "Food & Beverage",
            requiredMode = Schema.RequiredMode.REQUIRED)
    String industry;

    @Schema(description = "Free-form brand description.", example = "Specialty coffee roaster.")
    String description;

    @Schema(description = "Tone of voice for content.", example = "Friendly and warm")
    String brandVoice;

    @NotBlank(message = "TARGET_AUDIENCE_REQUIRED")
    @Schema(description = "Target audience.", example = "Young professionals 25-35",
            requiredMode = Schema.RequiredMode.REQUIRED)
    String targetAudience;

    @Schema(description = "Content goal.", example = "Increase brand awareness")
    String contentGoal;

    @NotEmpty(message = "PLATFORM_REQUIRED")
    @Schema(description = "Platforms to publish on.", requiredMode = Schema.RequiredMode.REQUIRED)
    Set<Platform> platforms;

    @NotNull(message = "POSTING_FREQUENCY_REQUIRED")
    @Schema(description = "How often content should be posted.", requiredMode = Schema.RequiredMode.REQUIRED)
    PostingFrequency postingFrequency;

    @Schema(description = "Preferred posting time slots.", example = "[\"09:00\", \"18:00\"]")
    List<String> preferredTimes;
}
