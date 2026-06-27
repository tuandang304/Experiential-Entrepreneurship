package com.aima.dto.response;

import com.aima.enums.Platform;
import com.aima.enums.StrategyStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "ContentStrategyResponse", description = "Content strategy details.")
public class ContentStrategyResponse {

    @Schema(description = "Unique strategy identifier.", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID id;

    @Schema(description = "Owning brand profile id.", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
    UUID brandId;

    @Schema(description = "Strategy name.", example = "Tăng nhận diện thương hiệu")
    String name;

    @Schema(description = "Strategy status.", example = "DRAFT")
    StrategyStatus status;

    @Schema(description = "Content goals.")
    List<String> goals;

    @Schema(description = "Preferred content types.")
    List<String> contentTypes;

    @Schema(description = "Post frequency count.", example = "3")
    Integer frequencyCount;

    @Schema(description = "Post frequency unit.", example = "WEEK")
    String frequencyUnit;

    @Schema(description = "Platforms to publish on.")
    Set<Platform> platforms;

    @Schema(description = "Preferred posting time slots.")
    List<String> timeSlots;

    @Schema(description = "Target audiences.")
    List<String> audiences;

    @Schema(description = "Content styles.")
    List<String> styles;

    @Schema(description = "Desired CTAs.")
    List<String> ctas;

    @Schema(description = "Creation timestamp.", example = "2026-06-08T09:30:00")
    LocalDateTime createdAt;

    @Schema(description = "Last update timestamp.", example = "2026-06-08T09:30:00")
    LocalDateTime updatedAt;
}
