package com.aima.mapper;

import com.aima.dto.request.RegeneratePartRequest;
import com.aima.dto.response.ContentRegenerationJobResponse;
import com.aima.entity.ContentRegenerationJob;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContentRegenerationJobMapper {

    // section/field/stepIndex auto-map (cùng tên); contentVersion do service set; status giữ default.
    @Mapping(target = "contentVersion", ignore = true)
    ContentRegenerationJob toRegenerationJob(RegeneratePartRequest request);

    // id/status/errorMessage auto-map; patch được service gắn sau khi parse resultPatch (JSON).
    @Mapping(target = "patch", ignore = true)
    ContentRegenerationJobResponse toResponse(ContentRegenerationJob job);
}
