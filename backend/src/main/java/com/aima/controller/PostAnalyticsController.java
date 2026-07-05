package com.aima.controller;

import com.aima.dto.response.AnalyzedPostResponse;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.PageResponse;
import com.aima.service.PostAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Post Analytics", description = "Collected performance metrics of published posts at 24h/48h/7d (FR-59..FR-62).")
public class PostAnalyticsController {

    PostAnalyticsService postAnalyticsService;

    @GetMapping("/posts")
    @Operation(summary = "List published posts with their metric snapshots (FR-61/FR-62)",
            description = "Paged, newest first; each post carries its 24h/48h/7d snapshots so the FE can display and compare.")
    public ApiResponse<PageResponse<AnalyzedPostResponse>> list(@AuthenticationPrincipal UserDetails principal,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        return postAnalyticsService.list(principal.getUsername(), page, size);
    }

    @GetMapping("/posts/{postId}")
    @Operation(summary = "Get one published post's metric snapshots")
    public ApiResponse<AnalyzedPostResponse> get(@AuthenticationPrincipal UserDetails principal,
                                                 @PathVariable UUID postId) {
        return postAnalyticsService.get(principal.getUsername(), postId);
    }
}
