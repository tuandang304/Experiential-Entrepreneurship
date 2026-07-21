package com.aima.mapper;

import com.aima.dto.response.AnalyticsTopPostResponse;
import com.aima.repository.projection.TopPostProjection;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Ánh xạ projection → DTO cho trang Phân tích. Các DTO thuần số (thẻ KPI, điểm chuỗi, tỷ trọng
 * nền tảng) được dựng trực tiếp trong service (ngoại lệ đã ghi ở DashboardMapper) nên chỉ dòng
 * "Top bài viết" (projection có cả trường entity) đi qua mapper này.
 *
 * <p>{@code platform} (String tên enum trong DB) → {@code Platform} do MapStruct tự dùng valueOf;
 * các trường cùng tên còn lại tự khớp.
 */
@Mapper(componentModel = "spring")
public interface AnalyticsMapper {

    AnalyticsTopPostResponse toTopPostResponse(TopPostProjection projection);

    List<AnalyticsTopPostResponse> toTopPostResponseList(List<TopPostProjection> projections);
}
