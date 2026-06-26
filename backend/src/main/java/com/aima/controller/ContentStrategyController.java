package com.aima.controller;

import com.aima.dto.request.ContentStrategyRequest;
import com.aima.dto.request.StrategyStatusRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentStrategyResponse;
import com.aima.service.ContentStrategyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/content-strategies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Content Strategies", description = "Content strategy management (BR-02: one brand → many strategies).")
public class ContentStrategyController {

    ContentStrategyService contentStrategyService;

    // FR-13: create
    @PostMapping
    @Operation(summary = "Create a content strategy",
            description = "Creates a strategy under a brand profile owned by the authenticated user (BR-02).")
    public ApiResponse<ContentStrategyResponse> create(@AuthenticationPrincipal UserDetails principal,
                                                       @Valid @RequestBody ContentStrategyRequest request) {
        return contentStrategyService.create(principal.getUsername(), request);
    }

    // FR-07: list (all for the user, or filtered by brandId)
    @GetMapping
    @Operation(summary = "List content strategies",
            description = "Lists the authenticated user's strategies; pass brandId to filter by a single brand.")
    public ApiResponse<List<ContentStrategyResponse>> list(@AuthenticationPrincipal UserDetails principal,
                                                          @RequestParam(required = false) UUID brandId) {
        return contentStrategyService.list(principal.getUsername(), brandId);
    }

    // FR-07: view one
    @GetMapping("/{id}")
    @Operation(summary = "Get a content strategy by id",
            description = "Returns a single strategy owned by the authenticated user; 404 if not found.")
    public ApiResponse<ContentStrategyResponse> get(@AuthenticationPrincipal UserDetails principal,
                                                    @PathVariable UUID id) {
        return contentStrategyService.get(principal.getUsername(), id);
    }

    // FR-13: update
    @PutMapping("/{id}")
    @Operation(summary = "Update a content strategy",
            description = "Updates a strategy owned by the authenticated user; 404 if not found.")
    public ApiResponse<ContentStrategyResponse> update(@AuthenticationPrincipal UserDetails principal,
                                                      @PathVariable UUID id,
                                                      @Valid @RequestBody ContentStrategyRequest request) {
        return contentStrategyService.update(principal.getUsername(), id, request);
    }

    // FR-13: activate / pause
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update a content strategy's status",
            description = "Activates or pauses a strategy (DRAFT / ACTIVE / PAUSED); 404 if not found.")
    public ApiResponse<ContentStrategyResponse> updateStatus(@AuthenticationPrincipal UserDetails principal,
                                                            @PathVariable UUID id,
                                                            @Valid @RequestBody StrategyStatusRequest request) {
        return contentStrategyService.updateStatus(principal.getUsername(), id, request.getStatus());
    }

    // FR-08: soft-delete
    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a content strategy",
            description = "Soft-deletes (marks deletedAt) a strategy owned by the authenticated user; 404 if not found.")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserDetails principal, @PathVariable UUID id) {
        return contentStrategyService.delete(principal.getUsername(), id);
    }
}
