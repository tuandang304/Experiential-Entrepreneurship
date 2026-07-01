package com.aima.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient dùng riêng để gọi AI service (base URL cố định, không đổi theo từng request
 * như Meta — xem {@link MetaWebClientConfig} để so sánh).
 */
@Configuration
@EnableConfigurationProperties(AiServiceProperties.class)
public class AiServiceWebClientConfig {

    @Bean(name = "aiServiceWebClient")
    public WebClient aiServiceWebClient(AiServiceProperties properties) {
        return WebClient.builder().baseUrl(properties.baseUrl()).build();
    }
}
