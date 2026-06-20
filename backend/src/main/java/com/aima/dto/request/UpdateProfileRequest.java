package com.aima.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "UpdateProfileRequest", description = "Payload to complete or update the current user's profile.")
public class UpdateProfileRequest {

    @NotBlank(message = "FULLNAME_REQUIRED")
    @Size(max = 255, message = "INVALID_FULLNAME")
    @Schema(description = "Display name.", example = "John Doe", requiredMode = Schema.RequiredMode.REQUIRED)
    String fullName;

    @NotBlank(message = "PHONE_REQUIRED")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "INVALID_PHONE")
    @Schema(description = "Phone number, 10-11 digits.", example = "0901234567",
            requiredMode = Schema.RequiredMode.REQUIRED)
    String phone;

    @NotNull(message = "DATE_OF_BIRTH_REQUIRED")
    @Past(message = "INVALID_DATE_OF_BIRTH")
    @Schema(description = "Date of birth (ISO-8601, must be in the past).", example = "1998-05-20",
            requiredMode = Schema.RequiredMode.REQUIRED)
    LocalDate dateOfBirth;

    @Size(max = 500, message = "INVALID_AVATAR_URL")
    @Schema(description = "Avatar image URL (typically the public URL returned by POST /files/avatar).",
            example = "https://xyz.supabase.co/storage/v1/object/public/avatars/<userId>/<uuid>_avatar.png")
    String avatarUrl;
}
