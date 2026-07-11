package com.aima.controller;

import com.aima.dto.request.RegeneratePartRequest;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.ContentRegenerationJobResponse;
import com.aima.service.ContentRegenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/content-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Content Regeneration", description = "Regenerate one part of a version's video script (NFR-04 async).")
public class ContentRegenerationController {

    ContentRegenerationService contentRegenerationService;

    // NFR-04: trả về job ngay; worker patch in-place đúng phần rồi FE poll về merge.
    @PostMapping("/{itemId}/versions/{versionId}/regenerate-part")
    @Operation(summary = "Regenerate one script part (hook/body/cta × content/scene)",
            description = "Starts an async job that regenerates ONLY the requested part of the version's script; "
                    + "other parts are left untouched. The item must be editable (DRAFT/GENERATED/NEED_REVIEW/APPROVED).")
    public ApiResponse<ContentRegenerationJobResponse> regeneratePart(@AuthenticationPrincipal UserDetails principal,
                                                                      @PathVariable UUID itemId,
                                                                      @PathVariable UUID versionId,
                                                                      @Valid @RequestBody RegeneratePartRequest request) {
        return contentRegenerationService.startRegeneration(principal.getUsername(), itemId, versionId, request);
    }

    @GetMapping("/regen-jobs/{jobId}")
    @Operation(summary = "Get a partial-regeneration job's status",
            description = "Polled by the frontend until status is SUCCESS or FAILED; the regenerated fragment is in `patch`.")
    public ApiResponse<ContentRegenerationJobResponse> getRegenJob(@AuthenticationPrincipal UserDetails principal,
                                                                   @PathVariable UUID jobId) {
        return contentRegenerationService.getJob(principal.getUsername(), jobId);
    }
}
