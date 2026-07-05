package com.aima.mapper;

import com.aima.dto.response.AuthenticationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthenticationMapper {

    // Đăng nhập/refresh thường: refresh token chỉ đi qua cookie nên bỏ khỏi body.
    @Mapping(target = "authenticated", constant = "true")
    @Mapping(target = "refreshToken", ignore = true)
    AuthenticationResponse toAuthResponse(String token);

    // OAuth2: cần trả kèm refresh token để handler set cookie.
    @Mapping(target = "authenticated", constant = "true")
    AuthenticationResponse toAuthResponse(String token, String refreshToken);
}
