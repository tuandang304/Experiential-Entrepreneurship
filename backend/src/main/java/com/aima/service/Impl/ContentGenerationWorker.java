package com.aima.service.Impl;

import com.aima.dto.ai.BrandProfileInputPayload;
import com.aima.dto.ai.ContentStrategyInputPayload;
import com.aima.dto.ai.GenerateContentPayload;
import com.aima.dto.ai.GeneratedContentResult;
import com.aima.dto.ai.VideoScriptPayload;
import com.aima.entity.BrandProfile;
import com.aima.entity.ContentGenerationJob;
import com.aima.entity.ContentItem;
import com.aima.entity.ContentStrategy;
import com.aima.enums.ContentLifecycle;
import com.aima.enums.GenerationJobStatus;
import com.aima.exception.AppException;
import com.aima.repository.ContentGenerationJobRepository;
import com.aima.repository.ContentItemRepository;
import com.aima.service.AiServiceClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Xử lý nền cho {@link ContentGenerationJob} (NFR-04) — bean riêng để tránh self-invocation
 * issue của @Async khi gọi từ {@link ContentGenerationServiceImpl}.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ContentGenerationWorker {

    ContentGenerationJobRepository jobRepository;
    ContentItemRepository contentItemRepository;
    AiServiceClient aiServiceClient;

    @Async("contentGenerationExecutor")
    @Transactional
    public void process(UUID jobId) {
        ContentGenerationJob job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.warn("[ContentGeneration] Job {} không tồn tại khi bắt đầu xử lý", jobId);
            return;
        }
        job.setStatus(GenerationJobStatus.RUNNING);
        jobRepository.save(job);

        try {
            ContentStrategy strategy = job.getContentStrategy();
            BrandProfile brand = strategy.getBrandProfile();

            GenerateContentPayload payload = GenerateContentPayload.builder()
                    .brandProfile(toBrandProfilePayload(brand))
                    .strategy(toStrategyPayload(strategy))
                    .platform(job.getPlatform().name())
                    .topic(job.getTopic())
                    .regenerateFrom(job.getRegenerateFrom())
                    .build();

            GeneratedContentResult result = aiServiceClient.generateContent(payload);

            ContentItem item = new ContentItem();
            item.setBrandProfile(brand);
            item.setScript(formatScript(result));
            item.setCaption(result.getCaption());
            item.setHashtag(result.getHashtags() == null ? null : String.join(",", result.getHashtags()));
            item.setCta(result.getCta());
            item.setMediaPrompt(result.getMediaPrompt());
            item.setStatus(ContentLifecycle.GENERATED);
            contentItemRepository.save(item);

            job.setResultContentItem(item);
            job.setStatus(GenerationJobStatus.SUCCESS);
            jobRepository.save(job);
        } catch (Exception e) {
            // AppException không set message qua super(...) — getMessage() luôn null, nên phải
            // lấy message từ ErrorCode; các exception khác (NPE, timeout...) dùng getMessage() thường.
            String message = (e instanceof AppException appException && appException.getErrorCode() != null)
                    ? appException.getErrorCode().getMessage()
                    : e.getMessage();
            log.warn("[ContentGeneration] Job {} thất bại: {}", jobId, message, e);
            job.setStatus(GenerationJobStatus.FAILED);
            job.setErrorMessage(message);
            jobRepository.save(job);
        }
    }

    private BrandProfileInputPayload toBrandProfilePayload(BrandProfile brand) {
        List<String> contentGoals = StringUtils.hasText(brand.getContentGoal())
                ? List.of(brand.getContentGoal())
                : List.of();
        return BrandProfileInputPayload.builder()
                .brandName(brand.getBrandName())
                .industry(brand.getIndustry())
                .description(brand.getDescription())
                .brandVoice(brand.getBrandVoice())
                .targetAudience(brand.getTargetAudience())
                .contentGoals(contentGoals)
                .platforms(brand.getPlatforms().stream().map(Enum::name).collect(Collectors.toList()))
                .build();
    }

    private ContentStrategyInputPayload toStrategyPayload(ContentStrategy strategy) {
        return ContentStrategyInputPayload.builder()
                .goals(strategy.getGoals())
                .contentTypes(strategy.getContentTypes())
                .frequency(strategy.getFrequencyCount() + "/" + strategy.getFrequencyUnit())
                .platforms(strategy.getPlatforms().stream().map(Enum::name).collect(Collectors.toList()))
                .audience(String.join(", ", strategy.getTargetAudience()))
                .contentStyle(String.join(", ", strategy.getContentStyle()))
                .ctaType(String.join(", ", strategy.getCtaTypes()))
                .build();
    }

    private String formatScript(GeneratedContentResult result) {
        VideoScriptPayload script = result.getScript();
        if (script == null) {
            return null;
        }
        List<String> lines = new ArrayList<>();
        if (StringUtils.hasText(script.getHook())) lines.add(script.getHook());
        if (StringUtils.hasText(script.getMainContent())) lines.add(script.getMainContent());
        if (script.getShotSuggestions() != null) lines.addAll(script.getShotSuggestions());
        if (StringUtils.hasText(script.getCta())) lines.add(script.getCta());
        return String.join("\n", lines);
    }
}
