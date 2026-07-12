package com.aima.dto.request;

import com.aima.enums.UserPlan;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
@Schema(name = "AdminCreateUserRequest", description = "Admin tạo tài khoản người dùng thủ công (FR-80). Mặc định gói FREE.")
public class AdminCreateUserRequest {

    @NotBlank(message = "FULLNAME_REQUIRED")
    @Size(max = 255, message = "INVALID_FULLNAME")
    @Schema(example = "Nguyễn Văn A")
    String fullName;

    @NotBlank(message = "EMAIL_REQUIRED")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "INVALID_EMAIL_FORMAT")
    @Schema(example = "nguyenvana@gmail.com")
    String email;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "INVALID_PHONE")
    @Schema(example = "0901234567")
    String phone;

    @NotBlank(message = "PASSWORD_REQUIRED")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$", message = "WEAK_PASSWORD")
    @Schema(description = "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.", example = "Passw0rd!")
    String password;

    @Schema(description = "USER hoặc ADMIN; mặc định USER.", example = "USER")
    String role;

    @Schema(description = "Gói khởi tạo; mặc định FREE.", example = "FREE")
    UserPlan plan;
}
