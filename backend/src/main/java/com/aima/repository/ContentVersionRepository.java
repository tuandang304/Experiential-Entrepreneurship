package com.aima.repository;

import com.aima.entity.ContentVersion;
import com.aima.enums.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContentVersionRepository extends JpaRepository<ContentVersion, UUID> {

    // API-03/SEC-04: user chỉ thao tác trên bản định dạng thuộc brand profile của mình.
    Optional<ContentVersion> findByIdAndContentItem_BrandProfile_User_IdAndDeletedAtIsNull(UUID id, UUID userId);

    // B2: các bản còn hiệu lực của (bài, nền tảng) — retry/tạo lại thay bản cũ bằng xóa mềm.
    List<ContentVersion> findAllByContentItem_IdAndPlatformNameAndDeletedAtIsNull(UUID contentItemId, Platform platformName);
}
