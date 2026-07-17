package com.aima.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Một model trong catalog đã đồng bộ của provider (dropdown gợi ý ở modal "Thêm model").
 * 4 field đầu cũng là shape JSONB lưu trong {@code ai_providers.model_catalog} (NON_NULL để
 * bản lưu không phình null); giá gợi ý join từ {@code ai_model_price_catalog} lúc ĐỌC —
 * không bao giờ persist vào cache catalog.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiCatalogModelResponse {

    String id;

    String displayName;

    Integer maxInputTokens;

    Integer maxTokens;

    /** Giá gợi ý USD/1M token từ bảng giá tự bảo trì; null = model chưa có trong bảng giá. */
    BigDecimal suggestedInputPricePer1m;

    BigDecimal suggestedOutputPricePer1m;
}
