package com.aima.mapper;

import com.aima.dto.response.ContentGenerationJobResponse;
import com.aima.entity.ContentGenerationJob;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = ContentItemMapper.class)
public interface ContentGenerationJobMapper {

    @Mapping(target = "contentItem", source = "resultContentItem")
    ContentGenerationJobResponse toContentGenerationJobResponse(ContentGenerationJob job);
}
