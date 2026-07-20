package com.aima.dto.response;

import com.aima.enums.ConnectionStatus;
import com.aima.enums.Platform;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Trạng thái kết nối của MỘT nền tảng trong scope MVP (Facebook → Instagram → Threads) cho panel
 * "Nền tảng đã kết nối". Luôn trả đủ 3 nền tảng: nền tảng chưa liên kết có {@code connected=false}
 * và các trường tài khoản để null. Không bao giờ chứa access/refresh token (SEC-03).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardPlatformResponse", description = "Trạng thái kết nối của một nền tảng mạng xã hội.")
public class DashboardPlatformResponse {

    @Schema(description = "Nền tảng.", example = "FACEBOOK")
    Platform platform;

    @Schema(description = "true khi có tài khoản đang ACTIVE trên nền tảng này.")
    boolean connected;

    @Schema(description = "Tên tài khoản hiển thị; null khi chưa kết nối.", example = "AIMA Official")
    String accountName;

    @Schema(description = "Ảnh đại diện của tài khoản; null khi chưa kết nối hoặc nền tảng không cung cấp.")
    String avatarUrl;

    @Schema(description = "Trạng thái kết nối chi tiết (ACTIVE/EXPIRED/REVOKED/...); null khi chưa kết nối.",
            example = "ACTIVE")
    ConnectionStatus status;
}
