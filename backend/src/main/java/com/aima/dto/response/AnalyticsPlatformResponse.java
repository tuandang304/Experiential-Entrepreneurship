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
 * Một nền tảng trong khối D ("Hiệu suất theo nền tảng"). Luôn trả đủ 3 nền tảng trong scope
 * (FACEBOOK/INSTAGRAM/THREADS), kể cả chưa kết nối — nền tảng chưa kết nối ({@code connected=false},
 * {@code accountName=null}) để FE hiển thị CTA "Kết nối ngay". Không mang access/refresh token (SEC-03).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "AnalyticsPlatformResponse", description = "Số liệu + trạng thái kết nối của một nền tảng.")
public class AnalyticsPlatformResponse {

    @Schema(description = "Nền tảng.", example = "FACEBOOK")
    Platform platform;

    @Schema(description = "true khi có kết nối ACTIVE; false → FE hiển thị CTA kết nối/kết nối lại.", example = "true")
    boolean connected;

    @Schema(description = "Tên tài khoản đại diện của nền tảng; null khi chưa kết nối.", example = "AIMA Fanpage")
    String accountName;

    @Schema(description = "Ảnh đại diện tài khoản; null khi chưa kết nối hoặc không có.")
    String avatarUrl;

    @Schema(description = "Trạng thái kết nối; null khi chưa kết nối.", example = "ACTIVE")
    ConnectionStatus status;

    @Schema(description = "Lượt xem trong kỳ.", example = "8200")
    long views;

    @Schema(description = "Lượt thích.", example = "640")
    long likes;

    @Schema(description = "Bình luận.", example = "120")
    long comments;

    @Schema(description = "Chia sẻ.", example = "45")
    long shares;

    @Schema(description = "Tương tác = likes + comments + shares.", example = "805")
    long engagement;

    @Schema(description = "Tỷ trọng tương tác của nền tảng trên tổng (%).", example = "62.5")
    double sharePct;
}
