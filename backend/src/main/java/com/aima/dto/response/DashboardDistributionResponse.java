package com.aima.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một lát của biểu đồ phân bổ (donut "Loại nội dung").
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(name = "DashboardDistributionResponse", description = "Một nhóm trong biểu đồ phân bổ loại nội dung.")
public class DashboardDistributionResponse {

    @Schema(description = "Nhãn nhóm; 'OTHER' khi bản nền tảng chưa có định dạng media.", example = "VIDEO")
    String label;

    @Schema(description = "Số bản nền tảng thuộc nhóm.", example = "12")
    long value;

    @Schema(description = "Tỉ trọng trên tổng, làm tròn 1 chữ số thập phân.", example = "37.5")
    double sharePct;
}
