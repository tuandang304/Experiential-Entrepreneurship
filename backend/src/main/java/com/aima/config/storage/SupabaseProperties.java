package com.aima.config.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "supabase")
public record SupabaseProperties(
        String url,
        String anonKey,
        String serviceKey
) {
}
