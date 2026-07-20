package com.aima.mapper;

import com.aima.dto.response.DashboardPlatformResponse;
import com.aima.dto.response.DashboardTopicResponse;
import com.aima.entity.PlatformAccount;
import com.aima.enums.Platform;
import com.aima.repository.projection.TopicMetricProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Chuyển entity/projection sang DTO cho Bảng điều khiển. Các con số thuần tính toán
 * (thẻ số liệu, điểm biểu đồ zero-fill, tỉ trọng donut) không có entity nguồn nên được
 * dựng trực tiếp trong service — cùng cách các DTO thống kê sẵn có làm
 * ({@code ConnectionStatsResponse}, {@code RevenueSummaryResponse}).
 */
@Mapper(componentModel = "spring")
public interface DashboardMapper {

    // Nền tảng ĐÃ liên kết — token không bao giờ được map sang response (SEC-03).
    @Mapping(target = "platform", source = "account.platformName")
    @Mapping(target = "status", source = "account.connectionStatus")
    DashboardPlatformResponse toPlatformResponse(PlatformAccount account, boolean connected);

    // Nền tảng CHƯA liên kết — panel luôn hiện đủ 3 nền tảng trong scope MVP.
    // (param `platform` tự map vào field cùng tên; connected mặc định false của boolean.)
    @Mapping(target = "connected", ignore = true)
    @Mapping(target = "accountName", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    DashboardPlatformResponse toDisconnectedPlatformResponse(Platform platform);

    DashboardTopicResponse toTopicResponse(TopicMetricProjection projection);

    List<DashboardTopicResponse> toTopicResponseList(List<TopicMetricProjection> projections);
}
