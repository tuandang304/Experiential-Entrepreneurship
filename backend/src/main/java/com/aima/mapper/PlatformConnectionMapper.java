package com.aima.mapper;

import com.aima.dto.response.PlatformConnectionResponse;
import com.aima.entity.PlatformAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PlatformConnectionMapper {

    @Mapping(target = "platform", source = "platformName")
    @Mapping(target = "parentConnectionId", source = "parentConnection.id")
    @Mapping(target = "tokenDaysRemaining", source = "tokenExpiredAt", qualifiedByName = "daysUntil")
    PlatformConnectionResponse toResponse(PlatformAccount account);

    List<PlatformConnectionResponse> toResponseList(List<PlatformAccount> accounts);

    @Named("daysUntil")
    default Long daysUntil(LocalDateTime tokenExpiredAt) {
        return tokenExpiredAt == null ? null : ChronoUnit.DAYS.between(LocalDateTime.now(), tokenExpiredAt);
    }
}
