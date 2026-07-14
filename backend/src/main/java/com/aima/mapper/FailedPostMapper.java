package com.aima.mapper;

import com.aima.dto.response.FailedPostResponse;
import com.aima.entity.Post;
import com.aima.entity.PostingJob;
import com.aima.entity.PublishResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Trang "Bài lỗi & cần xử lý" của user (FR-35..FR-39) — trung tâm hồi phục bài của chính mình.
 * Tách khỏi {@link AdminMonitorMapper} (góc nhìn toàn hệ thống FR-82/83) vì DTO/mục đích khác.
 */
@Mapper(componentModel = "spring")
public interface FailedPostMapper {

    // job = PostingJob FAILED cuối (mang errorType), error = PublishResult lỗi cuối (mã gốc FR-35).
    @Mapping(target = "id", source = "post.id")
    @Mapping(target = "scheduleId", source = "post.schedule.id")
    @Mapping(target = "contentItemId", source = "post.schedule.contentVersion.contentItem.id")
    @Mapping(target = "platformName", source = "post.platformName")
    @Mapping(target = "accountName", source = "post.schedule.platformAccount.accountName")
    @Mapping(target = "caption", source = "post.schedule.contentVersion.formattedCaption")
    @Mapping(target = "errorType", source = "job.errorType")
    @Mapping(target = "errorCode", source = "error.responseCode")
    @Mapping(target = "errorMessage", source = "error.responseMessage")
    @Mapping(target = "failedAt", source = "job.endTime")
    FailedPostResponse toFailedPost(Post post, PostingJob job, PublishResult error);
}
