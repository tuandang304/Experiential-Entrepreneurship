package com.aima.service.Impl;

import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.FailedPostResponse;
import com.aima.dto.response.FailedPostSummaryResponse;
import com.aima.dto.response.PageResponse;
import com.aima.entity.Post;
import com.aima.entity.PostingJob;
import com.aima.entity.PublishResult;
import com.aima.entity.User;
import com.aima.enums.FailedPostFilter;
import com.aima.enums.PostingJobStatus;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.FailedPostMapper;
import com.aima.repository.PostRepository;
import com.aima.repository.UserRepository;
import com.aima.service.FailedPostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * FR-35..FR-39 — trang "Bài lỗi & cần xử lý": gom bài đăng thất bại của chính user, phân loại
 * vi phạm chính sách vs lỗi kỹ thuật, kèm scheduleId/contentItemId để tái dùng hành động hồi phục
 * đã có (dời giờ/hủy ở Lịch, sửa/tạo lại ở wizard).
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional(readOnly = true)
public class FailedPostServiceImpl implements FailedPostService {

    PostRepository postRepository;
    UserRepository userRepository;
    FailedPostMapper failedPostMapper;

    @Override
    public ApiResponse<PageResponse<FailedPostResponse>> list(String email, FailedPostFilter filter, int page, int size) {
        User user = currentUser(email);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        String mode = (filter == null ? FailedPostFilter.ALL : filter).name();
        Page<Post> posts = postRepository.findFailedForUser(user.getId(), mode, pageable);

        List<FailedPostResponse> content = posts.getContent().stream()
                .map(this::toFailedPost)
                .toList();
        PageResponse<FailedPostResponse> response = PageResponse.from(posts, content);
        return ApiResponse.success("Lấy danh sách bài lỗi thành công", response);
    }

    @Override
    public ApiResponse<FailedPostSummaryResponse> summary(String email) {
        User user = currentUser(email);
        long total = postRepository.countFailedForUser(user.getId());
        long policy = postRepository.countPolicyFailedForUser(user.getId());
        // Tổng hợp scalar (không phải map entity→DTO): MapStruct sinh guard rỗng với toàn tham số
        // nguyên thủy nên dựng thẳng bằng builder.
        FailedPostSummaryResponse response = FailedPostSummaryResponse.builder()
                .total(total)
                .policyViolation(policy)
                .technical(total - policy)
                .build();
        return ApiResponse.success("Lấy tổng quan lỗi thành công", response);
    }

    // Job FAILED cuối = nguồn errorType/thời điểm; PublishResult lỗi cuối = mã + message gốc (FR-35).
    private FailedPostResponse toFailedPost(Post post) {
        PostingJob lastFailedJob = post.getPostingJobs().stream()
                .filter(j -> j.getStatus() == PostingJobStatus.FAILED)
                .max(Comparator.comparing(PostingJob::getEndTime,
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .orElse(null);
        PublishResult lastError = post.getPublishResults().stream()
                .filter(r -> Boolean.FALSE.equals(r.getIsSuccess()))
                .max(Comparator.comparing(PublishResult::getCreatedAt,
                        Comparator.nullsFirst(Comparator.naturalOrder())))
                .orElse(null);
        return failedPostMapper.toFailedPost(post, lastFailedJob, lastError);
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
