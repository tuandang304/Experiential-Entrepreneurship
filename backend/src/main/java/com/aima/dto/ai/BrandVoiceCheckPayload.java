package com.aima.dto.ai;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Mirrors ai/src/schemas.py BrandVoiceCheck (FR-30) — AI tự chấm độ khớp brand voice
 * của bản nội dung vừa sinh. Persist vào ContentVersion (voice_aligned/score/notes).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandVoiceCheckPayload {

    Boolean aligned;

    Integer score;

    String notes;
}
