package com.aima.dto.request;

import com.aima.enums.UserPlan;
import com.aima.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "AdminUpdateUserRequest",
        description = "Admin cập nhật hồ sơ/gói/vai trò/trạng thái người dùng (partial — chỉ ghi đè trường có giá trị).")
public class AdminUpdateUserRequest {

    @Size(max = 255, message = "INVALID_FULLNAME")
    String fullName;

    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "INVALID_EMAIL_FORMAT")
    String email;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "INVALID_PHONE")
    String phone;

    @Size(max = 500, message = "INVALID_AVATAR_URL")
    String avatarUrl;

    @Schema(description = "USER hoặc ADMIN.", example = "USER")
    String role;

    @Schema(description = "Gói: FREE / PLUS / PRO.", example = "PLUS")
    UserPlan plan;

    @Schema(description = "Trạng thái: ACTIVE / LOCKED / PENDING_DELETE.", example = "ACTIVE")
    UserStatus status;
}
