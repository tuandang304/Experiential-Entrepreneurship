package com.aima.entity;

import com.aima.enums.ConnectionStatus;
import com.aima.enums.Platform;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "platform_accounts")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlatformAccount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform_name", nullable = false, length = 20)
    Platform platformName;

    @Column(name = "account_name", nullable = false, length = 150)
    String accountName;

    @Column(name = "access_token", nullable = false, columnDefinition = "text")
    String accessToken;

    @Column(name = "refresh_token", columnDefinition = "text")
    String refreshToken;

    @Column(name = "token_expired_at")
    LocalDateTime tokenExpiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_status", nullable = false, length = 20)
    ConnectionStatus connectionStatus;
}
