package com.aima.config.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(SupabaseProperties.class)
public class SupabaseConfig {

    private final SupabaseProperties supabaseProperties;

    /** Allow a 16 MB in-memory buffer so 10 MB PDF uploads are never truncated by the default 256 KB codec limit. */
    private static final int MAX_IN_MEMORY_SIZE = 16 * 1024 * 1024;

    @Bean
    public WebClient supabaseWebClient() {
        return WebClient.builder()
                .baseUrl(supabaseProperties.url() + "/storage/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseProperties.serviceKey())
                .defaultHeader("apikey", supabaseProperties.serviceKey())
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_IN_MEMORY_SIZE))
                .build();
    }
}
