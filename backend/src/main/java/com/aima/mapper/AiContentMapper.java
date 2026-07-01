package com.aima.mapper;

import com.aima.dto.ai.BrandProfileInputPayload;
import com.aima.dto.ai.ContentStrategyInputPayload;
import com.aima.entity.BrandProfile;
import com.aima.entity.ContentStrategy;
import com.aima.enums.Platform;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AiContentMapper {

    // brandName/industry/description/brandVoice/targetAudience auto-map (cùng tên, String→String).
    @Mapping(target = "contentGoals", source = "contentGoal", qualifiedByName = "wrapContentGoal")
    @Mapping(target = "platforms", source = "platforms", qualifiedByName = "platformsToNames")
    BrandProfileInputPayload toBrandProfilePayload(BrandProfile brand);

    // goals/contentTypes auto-map (List<String>); phần còn lại cần biến đổi.
    @Mapping(target = "frequency", expression = "java(strategy.getFrequencyCount() + \"/\" + strategy.getFrequencyUnit())")
    @Mapping(target = "platforms", source = "platforms", qualifiedByName = "platformsToNames")
    @Mapping(target = "audience", source = "targetAudience", qualifiedByName = "joinComma")
    @Mapping(target = "contentStyle", source = "contentStyle", qualifiedByName = "joinComma")
    @Mapping(target = "ctaType", source = "ctaTypes", qualifiedByName = "joinComma")
    ContentStrategyInputPayload toStrategyPayload(ContentStrategy strategy);

    @Named("wrapContentGoal")
    default List<String> wrapContentGoal(String contentGoal) {
        return StringUtils.hasText(contentGoal) ? List.of(contentGoal) : List.of();
    }

    @Named("platformsToNames")
    default List<String> platformsToNames(Collection<Platform> platforms) {
        return platforms == null ? List.of()
                : platforms.stream().map(Enum::name).collect(Collectors.toList());
    }

    @Named("joinComma")
    default String joinComma(List<String> values) {
        return values == null ? null : String.join(", ", values);
    }
}
