package com.aima.controller;

import com.aima.dto.request.BrandProfileRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.BrandProfileResponse;
import com.aima.service.BrandProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/brand-profiles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Brand Profiles", description = "Brand profile management.")
public class BrandProfileController {

    BrandProfileService brandProfileService;

    // FR-05: create
    @PostMapping
    public ApiResponse<BrandProfileResponse> create(@AuthenticationPrincipal UserDetails principal,
                                                    @Valid @RequestBody BrandProfileRequest request) {
        return brandProfileService.create(principal.getUsername(), request);
    }

    // FR-07: list
    @GetMapping
    public ApiResponse<List<BrandProfileResponse>> list(@AuthenticationPrincipal UserDetails principal) {
        return brandProfileService.list(principal.getUsername());
    }

    // FR-07: view one
    @GetMapping("/{id}")
    public ApiResponse<BrandProfileResponse> get(@AuthenticationPrincipal UserDetails principal,
                                                 @PathVariable UUID id) {
        return brandProfileService.get(principal.getUsername(), id);
    }

    // FR-06: update
    @PutMapping("/{id}")
    public ApiResponse<BrandProfileResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                    @PathVariable UUID id,
                                                    @Valid @RequestBody BrandProfileRequest request) {
        return brandProfileService.update(principal.getUsername(), id, request);
    }

    // FR-08: delete
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        return brandProfileService.delete(principal.getUsername(), id);
    }
}
