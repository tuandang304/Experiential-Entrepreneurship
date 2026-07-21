package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Chuỗi số liệu theo ngày cho biểu đồ đa series (khối C). Đã ĐIỀN 0 cho ngày không có bài đăng
 * để đường biểu đồ không bị gãy; trục X co giãn theo {@code rangeDays}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "AnalyticsTimeseriesResponse", description = "Chuỗi 4 metric theo ngày, đã zero-fill.")
public class AnalyticsTimeseriesResponse {

    @Schema(description = "Ngày bắt đầu kỳ (yyyy-MM-dd).", example = "2026-07-15")
    String from;

    @Schema(description = "Ngày kết thúc kỳ (yyyy-MM-dd, đã bao gồm).", example = "2026-07-21")
    String to;

    @Schema(description = "Số ngày của kỳ = số điểm trả về.", example = "7")
    int rangeDays;

    @Schema(description = "Danh sách điểm theo ngày (cũ → mới), đủ rangeDays điểm.")
    List<AnalyticsPointResponse> points;
}
