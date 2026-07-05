package com.aima.service.Impl;

import com.aima.dto.response.AnalyzedPostResponse;
import com.aima.dto.response.ApiResponse;
import com.aima.dto.response.PageResponse;
import com.aima.dto.response.PostAnalyticsResponse;
import com.aima.entity.Post;
import com.aima.entity.PostAnalytics;
import com.aima.entity.User;
import com.aima.enums.PostStatus;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.aima.mapper.PostAnalyticsMapper;
import com.aima.repository.PostRepository;
import com.aima.repository.UserRepository;
import com.aima.service.PostAnalyticsService;
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
import java.util.UUID;

/**
 * FR-60/FR-61/FR-62 (phần BE): xem số liệu các bài đã đăng — mỗi bài kèm các snapshot
 * theo mốc 24h/48h/7d để FE hiển thị và so sánh.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Transactional(readOnly = true)
public class PostAnalyticsServiceImpl implements PostAnalyticsService {

    PostRepository postRepository;
    UserRepository userRepository;
    PostAnalyticsMapper postAnalyticsMapper;

    @Override
    public ApiResponse<PageResponse<AnalyzedPostResponse>> list(String email, int page, int size) {
        User user = currentUser(email);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50));
        Page<Post> posts = postRepository
                .findByStatusAndSchedule_PlatformAccount_User_IdAndDeletedAtIsNullOrderByPublishedAtDesc(
                        PostStatus.POSTED, user.getId(), pageable);

        List<AnalyzedPostResponse> content = posts.getContent().stream()
                .map(this::toAnalyzedPost)
                .toList();
        PageResponse<AnalyzedPostResponse> response = PageResponse.from(posts, content);
        return ApiResponse.success("Lấy số liệu bài đăng thành công", response);
    }

    @Override
    public ApiResponse<AnalyzedPostResponse> get(String email, UUID postId) {
        User user = currentUser(email);
        Post post = postRepository
                .findByIdAndSchedule_PlatformAccount_User_IdAndDeletedAtIsNull(postId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        AnalyzedPostResponse response = toAnalyzedPost(post);
        return ApiResponse.success("Lấy số liệu bài đăng thành công", response);
    }

    // Snapshot còn hiệu lực, sắp theo mốc 24h → 48h → 7d.
    private AnalyzedPostResponse toAnalyzedPost(Post post) {
        List<PostAnalytics> rows = post.getPostAnalytics().stream()
                .filter(a -> a.getDeletedAt() == null)
                .sorted(Comparator.comparing(PostAnalytics::getCollectedAt))
                .toList();
        List<PostAnalyticsResponse> analytics = postAnalyticsMapper.toResponseList(rows);
        return postAnalyticsMapper.toAnalyzedPostResponse(post, analytics);
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
