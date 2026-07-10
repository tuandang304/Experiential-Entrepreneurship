package com.aima.util;

import com.aima.dto.common.ScriptSectionDto;
import com.aima.dto.common.ScriptStepDto;
import com.aima.dto.common.VideoScriptDto;
import com.aima.exception.AppException;
import com.aima.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Chuyển đổi giữa {@link VideoScriptDto} (hợp đồng API) và chuỗi JSON lưu trong cột text
 * `script` của ContentItem/ContentVersion. Bài cũ (script dạng dòng, trước khi có cấu trúc)
 * được parse fallback: dòng đầu = hook, dòng cuối = CTA, các dòng giữa = các bước — bản ghi
 * tự chuyển sang JSON ở lần cập nhật kế tiếp.
 */
public final class ScriptJson {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.NON_NULL)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private ScriptJson() {
    }

    public static String toJson(VideoScriptDto script) {
        if (script == null) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(script);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INVALID_CONTENT_SCRIPT);
        }
    }

    public static VideoScriptDto parse(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("{")) {
            try {
                return MAPPER.readValue(trimmed, VideoScriptDto.class);
            } catch (JsonProcessingException e) {
                // không phải JSON hợp lệ → coi như bài cũ dạng dòng
            }
        }
        return fromLegacyLines(trimmed);
    }

    /** Bản phẳng dễ đọc (chỉ nội dung nói, kèm timing) cho AI formatter / regenerate context. */
    public static String toPlainText(String raw) {
        VideoScriptDto script = parse(raw);
        if (script == null) {
            return raw;
        }
        List<String> lines = new ArrayList<>();
        if (script.getHook() != null) {
            lines.add(sectionLine("Hook", script.getHook()));
        }
        if (script.getSteps() != null) {
            for (ScriptStepDto step : script.getSteps()) {
                lines.add("Bước " + step.getIndex() + ": " + nullSafe(step.getContent()));
            }
        }
        if (script.getCta() != null) {
            lines.add(sectionLine("CTA", script.getCta()));
        }
        return String.join("\n", lines);
    }

    private static VideoScriptDto fromLegacyLines(String raw) {
        List<String> lines = raw.lines().map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (lines.isEmpty()) {
            return null;
        }
        ScriptSectionDto hook = ScriptSectionDto.builder().content(lines.get(0)).build();
        ScriptSectionDto cta = lines.size() > 1
                ? ScriptSectionDto.builder().content(lines.get(lines.size() - 1)).build()
                : null;
        List<ScriptStepDto> steps = new ArrayList<>();
        for (int i = 1; i < lines.size() - 1; i++) {
            steps.add(ScriptStepDto.builder().index(i).content(lines.get(i)).build());
        }
        return VideoScriptDto.builder().hook(hook).steps(steps).cta(cta).build();
    }

    private static String sectionLine(String label, ScriptSectionDto section) {
        String timing = StringUtils.hasText(section.getTiming()) ? " (" + section.getTiming() + ")" : "";
        return label + timing + ": " + nullSafe(section.getContent());
    }

    private static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
