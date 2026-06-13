package com.aima.mapper;

import com.aima.dto.response.BrandProfileResponse;
import com.aima.entity.BrandProfile;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BrandProfileMapper {

    BrandProfileResponse toBrandProfileResponse(BrandProfile brandProfile);

    List<BrandProfileResponse> toBrandProfileResponseList(List<BrandProfile> brandProfiles);
}
