package com.aima.mapper;

import com.aima.dto.ai.GeneratedContentResult;
import com.aima.dto.ai.VideoScriptPayload;
import com.aima.dto.request.ContentItemUpdateRequest;
import com.aima.dto.request.ContentVersionUpdateRequest;
import com.aima.dto.response.ContentItemResponse;
import com.aima.dto.response.ContentVersionResponse;
import com.aima.entity.ContentItem;
import com.aima.entity.ContentVersion;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ContentItemMapper {

    // B2: response kèm các bản nền tảng còn hiệu lực + tên thương hiệu cho card list.
    @Mapping(target = "hashtags", source = "hashtag", qualifiedByName = "splitHashtags")
    @Mapping(target = "versions", source = "contentVersions", qualifiedByName = "activeVersions")
    @Mapping(target = "brandProfileId", source = "brandProfile.id")
    @Mapping(target = "brandName", source = "brandProfile.brandName")
    ContentItemResponse toResponse(ContentItem item);

    @Mapping(target = "script", source = "script", qualifiedByName = "formatScript")
    @Mapping(target = "hashtag", source = "hashtags", qualifiedByName = "joinHashtags")
    @Mapping(target = "status", constant = "GENERATED")
    ContentItem toContentItem(GeneratedContentResult result);

    // B2: kết quả generate của MỘT nền tảng → ContentVersion GIÀU (worker gán platform + item).
    @Mapping(target = "script", source = "script", qualifiedByName = "formatScript")
    @Mapping(target = "formattedCaption", source = "caption")
    @Mapping(target = "formattedHashtag", source = "hashtags", qualifiedByName = "joinHashtags")
    @Mapping(target = "voiceAligned", source = "brandVoiceCheck.aligned")
    @Mapping(target = "voiceScore", source = "brandVoiceCheck.score")
    @Mapping(target = "voiceNotes", source = "brandVoiceCheck.notes")
    @Mapping(target = "status", constant = "GENERATED")
    ContentVersion toGeneratedVersion(GeneratedContentResult result);

    @Mapping(target = "formattedHashtags", source = "formattedHashtag", qualifiedByName = "splitHashtags")
    ContentVersionResponse toVersionResponse(ContentVersion version);

    // FR-33: partial update — field null giữ nguyên giá trị cũ.
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "hashtag", source = "hashtags", qualifiedByName = "joinHashtags")
    void update(ContentItemUpdateRequest request, @MappingTarget ContentItem item);

    // FR-33 trên bản nền tảng (B2) — cùng ngữ nghĩa partial update.
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "formattedCaption", source = "caption")
    @Mapping(target = "formattedHashtag", source = "hashtags", qualifiedByName = "joinHashtags")
    void updateVersion(ContentVersionUpdateRequest request, @MappingTarget ContentVersion version);

    /** Chỉ các bản còn hiệu lực (soft-deleted loại ra) — thứ tự giữ như trong item. */
    @Named("activeVersions")
    default List<ContentVersionResponse> activeVersions(List<ContentVersion> versions) {
        if (versions == null) {
            return List.of();
        }
        return versions.stream()
                .filter(v -> v.getDeletedAt() == null)
                .map(this::toVersionResponse)
                .toList();
    }

    @Named("splitHashtags")
    default List<String> splitHashtags(String hashtag) {
        if (hashtag == null || hashtag.isBlank()) {
            return List.of();
        }
        return Arrays.stream(hashtag.split(","))
                .map(String::trim)
                .filter(h -> !h.isEmpty())
                .collect(Collectors.toList());
    }

    @Named("joinHashtags")
    default String joinHashtags(List<String> hashtags) {
        return (hashtags == null || hashtags.isEmpty()) ? null : String.join(",", hashtags);
    }

    @Named("formatScript")
    default String formatScript(VideoScriptPayload script) {
        if (script == null) {
            return null;
        }
        List<String> lines = new ArrayList<>();
        if (StringUtils.hasText(script.getHook())) lines.add(script.getHook());
        if (StringUtils.hasText(script.getMainContent())) lines.add(script.getMainContent());
        if (script.getShotSuggestions() != null) lines.addAll(script.getShotSuggestions());
        if (StringUtils.hasText(script.getCta())) lines.add(script.getCta());
        return String.join("\n", lines);
    }
}
