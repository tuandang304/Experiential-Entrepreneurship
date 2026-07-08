package com.aima.content;

import com.aima.dto.ai.BrandVoiceCheckPayload;
import com.aima.dto.ai.GeneratedContentResult;
import com.aima.dto.ai.VideoScriptPayload;
import com.aima.dto.request.ContentVersionUpdateRequest;
import com.aima.dto.response.ContentItemResponse;
import com.aima.entity.BrandProfile;
import com.aima.entity.ContentItem;
import com.aima.entity.ContentVersion;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.Platform;
import com.aima.mapper.ContentItemMapper;
import com.aima.mapper.ContentItemMapperImpl;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Hợp đồng B2: kết quả /generate của Python → ContentVersion GIÀU (kèm brand-voice,
 * image_prompt), response bài chỉ chứa bản còn hiệu lực, và partial update version.
 * Test thuần (không Spring context) — dùng thẳng MapStruct impl đã generate.
 */
class ContentVersionMappingTest {

    private final ContentItemMapper mapper = new ContentItemMapperImpl();

    private GeneratedContentResult sampleResult() {
        return GeneratedContentResult.builder()
                .script(VideoScriptPayload.builder()
                        .hook("Da xỉn màu, lỗ chân lông to?")
                        .mainContent("3 bước mỗi sáng: làm sạch, dưỡng ẩm, chống nắng.")
                        .shotSuggestions(List.of("Cận cảnh trước/sau", "Text nổi từng bước"))
                        .cta("Theo dõi để nhận mẹo mỗi ngày!")
                        .build())
                .caption("Chỉ 3 bước mỗi ngày, da bạn đổi khác bất ngờ.")
                .hashtags(List.of("skincare", "toigian"))
                .cta("Theo dõi kênh nhé!")
                .mediaPrompt("Clip quay routine 3 bước, ánh sáng tự nhiên.")
                .imagePrompt("Ảnh vuông bàn trang điểm tối giản, tông pastel.")
                .brandVoiceCheck(BrandVoiceCheckPayload.builder().aligned(true).score(91).notes("Đúng giọng").build())
                .build();
    }

    @Test
    void generatedResultMapsToRichVersion() {
        ContentVersion version = mapper.toGeneratedVersion(sampleResult());

        // script flatten dạng dòng (hook \n thân \n cảnh quay... \n CTA) — khớp FE splitScript.
        assertEquals("Da xỉn màu, lỗ chân lông to?\n3 bước mỗi sáng: làm sạch, dưỡng ẩm, chống nắng."
                + "\nCận cảnh trước/sau\nText nổi từng bước\nTheo dõi để nhận mẹo mỗi ngày!", version.getScript());
        assertEquals("Chỉ 3 bước mỗi ngày, da bạn đổi khác bất ngờ.", version.getFormattedCaption());
        assertEquals("skincare,toigian", version.getFormattedHashtag());
        assertEquals("Theo dõi kênh nhé!", version.getCta());
        assertEquals("Clip quay routine 3 bước, ánh sáng tự nhiên.", version.getMediaPrompt());
        assertEquals("Ảnh vuông bàn trang điểm tối giản, tông pastel.", version.getImagePrompt());
        // FR-30: brand voice giờ được persist thay vì bỏ qua.
        assertEquals(Boolean.TRUE, version.getVoiceAligned());
        assertEquals(91, version.getVoiceScore());
        assertEquals("Đúng giọng", version.getVoiceNotes());
        assertEquals(ContentLifecycle.GENERATED, version.getStatus());
    }

    @Test
    void itemResponseContainsOnlyActiveVersionsAndBrandName() {
        UUID brandId = UUID.randomUUID();
        BrandProfile brand = new BrandProfile();
        brand.setId(brandId);
        brand.setBrandName("AIMA Skincare");

        ContentVersion active = mapper.toGeneratedVersion(sampleResult());
        active.setPlatformName(Platform.FACEBOOK);
        ContentVersion replaced = mapper.toGeneratedVersion(sampleResult());
        replaced.setPlatformName(Platform.FACEBOOK);
        replaced.setDeletedAt(LocalDateTime.now()); // bản cũ đã bị retry thay thế

        ContentItem item = new ContentItem();
        item.setBrandProfile(brand);
        item.getContentVersions().addAll(List.of(replaced, active));

        ContentItemResponse response = mapper.toResponse(item);
        assertEquals(1, response.getVersions().size(), "chỉ bản còn hiệu lực được trả về");
        assertEquals(91, response.getVersions().get(0).getVoiceScore());
        assertEquals("AIMA Skincare", response.getBrandName());
        // Brand filter của thư viện nội dung lọc theo id — response phải mang brandProfileId.
        assertEquals(brandId, response.getBrandProfileId());
    }

    @Test
    void updateVersionIsPartial() {
        ContentVersion version = mapper.toGeneratedVersion(sampleResult());
        mapper.updateVersion(ContentVersionUpdateRequest.builder()
                .caption("Caption đã sửa tay")
                .hashtags(List.of("moi"))
                .build(), version);

        assertEquals("Caption đã sửa tay", version.getFormattedCaption());
        assertEquals("moi", version.getFormattedHashtag());
        // field bỏ trống giữ nguyên
        assertTrue(version.getScript().startsWith("Da xỉn màu"));
        assertEquals("Theo dõi kênh nhé!", version.getCta());
        assertNull(version.getPlatformName(), "mapper không tự gán platform — worker gán");
    }
}
