package com.aima.mapper;

import com.aima.dto.request.ContentGenerationRequest;
import com.aima.dto.response.ContentGenerationJobResponse;
import com.aima.entity.ContentGenerationJob;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ContentItemMapper.class)
public interface ContentGenerationJobMapper {

    // B2: kết quả job là bản nền tảng (ContentVersion giàu) — map qua ContentItemMapper.toVersionResponse.
    @Mapping(target = "contentVersion", source = "resultContentVersion")
    ContentGenerationJobResponse toResponse(ContentGenerationJob job);

    @Mapping(target = "contentStrategy", ignore = true)
    @Mapping(target = "contentItem", ignore = true) // service resolve theo contentItemId + ownership
    ContentGenerationJob toContentGenerationJob(ContentGenerationRequest request);
}
