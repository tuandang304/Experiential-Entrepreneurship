package com.aima.config.redis;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.data.redis.autoconfigure.LettuceClientConfigurationBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    // Chỉ bật TLS khi spring.data.redis.ssl.enabled=true (vd Redis cloud).
    // Redis local trong Docker là plaintext: nếu ép useSsl() thì TLS handshake sẽ treo
    // tới khi timeout -> "Unable to connect ... <unresolved>:6379". Mặc định KHÔNG dùng SSL.
    @Bean
    @ConditionalOnProperty(name = "spring.data.redis.ssl.enabled", havingValue = "true")
    public LettuceClientConfigurationBuilderCustomizer lettuceCustomizer() {
        return builder -> builder
                .useSsl()
                .disablePeerVerification();
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
