package com.aima.mapper;

import com.aima.dto.response.ContentItemResponse;
import com.aima.entity.ContentItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ContentItemMapper {

    // hashtag lưu dạng chuỗi phân tách bằng dấu phẩy trong entity → tách lại thành list cho FE.
    @Mapping(target = "hashtags", source = "hashtag", qualifiedByName = "splitHashtags")
    ContentItemResponse toContentItemResponse(ContentItem item);

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
}
