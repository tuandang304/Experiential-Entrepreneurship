package com.aima.mapper;

import org.mapstruct.*;
import com.aima.dto.request.OAuth2UserInfo;
import com.aima.entity.User;

@Mapper(componentModel = "spring")
public interface OAuth2UserMapper {

    @Mapping(target = "role", ignore = true)
    User toUser(OAuth2UserInfo info);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "role", ignore = true)
    void updateGoogleFields(OAuth2UserInfo info, @MappingTarget User user);
}
