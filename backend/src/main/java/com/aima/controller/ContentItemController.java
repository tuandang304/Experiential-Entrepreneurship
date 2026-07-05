package com.aima.controller;

import com.aima.dto.request.ContentFormatRequest;
import com.aima.dto.request.ContentItemStatusRequest;
import com.aima.dto.request.ContentItemUpdateRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentFormattingJobResponse;
import com.aima.dto.response.ContentItemResponse;
import com.aima.dto.response.PageResponse;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import com.aima.service.ContentFormattingService;
import com.aima.service.ContentItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
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

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/content-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Content Item", description = "View, manually edit, review and platform-format generated content (FR-33, FR-34, FR-40..FR-46).")
public class ContentItemController {

    ContentItemService contentItemService;
    ContentFormattingService contentFormattingService;

    @GetMapping
    @Operation(summary = "Content library — list/filter/search (FR-87)",
            description = "Paged, newest first. Optional filters: status, platform (of formatted versions), "
                    + "industry, fromDate/toDate (ISO date, on createdAt), q (keyword in caption/script).")
    public ApiResponse<PageResponse<ContentItemResponse>> list(@AuthenticationPrincipal UserDetails principal,
                                                               @RequestParam(required = false) ContentLifecycle status,
                                                               @RequestParam(required = false) Platform platform,
                                                               @RequestParam(required = false) String industry,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                                                               @RequestParam(required = false) String q,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        return contentItemService.list(principal.getUsername(), status, platform, industry, fromDate, toDate, q, page, size);
    }

    @GetMapping("/{itemId}")
    @Operation(summary = "Get one content item",
            description = "Returns the item with its lifecycle status; scoped to the caller's brand profiles.")
    public ApiResponse<ContentItemResponse> getItem(@AuthenticationPrincipal UserDetails principal,
                                                    @PathVariable UUID itemId) {
        return contentItemService.getItem(principal.getUsername(), itemId);
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Delete a content item (FR-89)",
            description = "Only while DRAFT/GENERATED; soft-deletes the item and cascades to its "
                    + "ContentVersions and MediaAssets. Items in the posting pipeline cannot be deleted.")
    public ApiResponse<ContentItemResponse> delete(@AuthenticationPrincipal UserDetails principal,
                                                   @PathVariable UUID itemId) {
        return contentItemService.delete(principal.getUsername(), itemId);
    }

    @PutMapping("/{itemId}")
    @Operation(summary = "Manually edit a content item (FR-33)",
            description = "Partial update of script/caption/hashtags/CTA/media prompt; only allowed before the "
                    + "posting pipeline (DRAFT/GENERATED/NEED_REVIEW/APPROVED). Editing an APPROVED item moves it "
                    + "back to NEED_REVIEW.")
    public ApiResponse<ContentItemResponse> updateItem(@AuthenticationPrincipal UserDetails principal,
                                                       @PathVariable UUID itemId,
                                                       @Valid @RequestBody ContentItemUpdateRequest request) {
        return contentItemService.updateItem(principal.getUsername(), itemId, request);
    }

    @PatchMapping("/{itemId}/status")
    @Operation(summary = "Review flow status change (FR-34)",
            description = "Allowed transitions: GENERATED→NEED_REVIEW (submit for review), NEED_REVIEW→APPROVED (approve).")
    public ApiResponse<ContentItemResponse> updateStatus(@AuthenticationPrincipal UserDetails principal,
                                                         @PathVariable UUID itemId,
                                                         @Valid @RequestBody ContentItemStatusRequest request) {
        return contentItemService.updateStatus(principal.getUsername(), itemId, request);
    }

    // NFR-04: định dạng là tác vụ AI chạy nền — trả job ngay, FE poll.
    @PostMapping("/{itemId}/format")
    @Operation(summary = "Start platform formatting (FR-40..FR-46, BR-04)",
            description = "Starts an async job that formats the item into one ContentVersion per requested platform; "
                    + "the item must be GENERATED or APPROVED. Re-formatting soft-deletes the replaced versions.")
    public ApiResponse<ContentFormattingJobResponse> startFormatting(@AuthenticationPrincipal UserDetails principal,
                                                                     @PathVariable UUID itemId,
                                                                     @Valid @RequestBody ContentFormatRequest request) {
        return contentFormattingService.startFormatting(principal.getUsername(), itemId, request);
    }

    @GetMapping("/format-jobs/{jobId}")
    @Operation(summary = "Get a formatting job's status",
            description = "Polled by the frontend until status is SUCCESS or FAILED; includes the item's current versions.")
    public ApiResponse<ContentFormattingJobResponse> getFormattingJob(@AuthenticationPrincipal UserDetails principal,
                                                                      @PathVariable UUID jobId) {
        return contentFormattingService.getJob(principal.getUsername(), jobId);
    }
}
