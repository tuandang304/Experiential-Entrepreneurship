package com.aima.controller;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.FailedPostResponse;
import com.aima.dto.response.FailedPostSummaryResponse;
import com.aima.dto.response.PageResponse;
import com.aima.enums.FailedPostFilter;
import com.aima.service.FailedPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * FR-35..FR-39 — trung tâm hồi phục bài lỗi của CHÍNH user. Khác admin (FR-82/83/84, góc nhìn toàn
 * hệ thống) và NotificationBell (hộp thư). Hành động hồi phục tái dùng /schedules + wizard.
 */
@RestController
@RequestMapping("/me/failed-posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Failed Posts", description = "User recovery center for the caller's own failed/rejected posts (FR-35..FR-39).")
public class FailedPostController {

    FailedPostService failedPostService;

    @GetMapping
    @Operation(summary = "List the caller's failed posts (FR-35..FR-39)",
            description = "Paged, newest failure first. filter = ALL | POLICY (policy violation, no retry) | "
                    + "TECHNICAL (technical error, retryable). Each row carries scheduleId + contentItemId for recovery.")
    public ApiResponse<PageResponse<FailedPostResponse>> list(@AuthenticationPrincipal UserDetails principal,
                                                              @RequestParam(defaultValue = "ALL") FailedPostFilter filter,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        return failedPostService.list(principal.getUsername(), filter, page, size);
    }

    @GetMapping("/summary")
    @Operation(summary = "Failure overview counts (total / policy / technical)",
            description = "Drives the 'error overview' block on the recovery page.")
    public ApiResponse<FailedPostSummaryResponse> summary(@AuthenticationPrincipal UserDetails principal) {
        return failedPostService.summary(principal.getUsername());
    }
}
