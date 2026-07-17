package com.aima.entity;

import com.aima.enums.AiProviderCode;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "ai_model_price_catalog", indexes = {
        @Index(name = "idx_ai_model_price_catalog_model", columnList = "provider_code, model_code")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiModelPriceCatalog extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_code", nullable = false, length = 30)
    AiProviderCode providerCode;

    @Column(name = "model_code", nullable = false, length = 100)
    String modelCode;

    @Column(name = "input_price_per_1m", precision = 12, scale = 4)
    BigDecimal inputPricePer1m;

    @Column(name = "output_price_per_1m", precision = 12, scale = 4)
    BigDecimal outputPricePer1m;
}
