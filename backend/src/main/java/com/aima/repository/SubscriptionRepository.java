package com.aima.repository;

import com.aima.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    /**
     * Fetch-join plan: caller (checkQuota từ scheduler) có thể đọc plan SAU khi transaction
     * của getOrCreate đóng — không để lazy proxy gây LazyInitializationException.
     */
    @Query("""
            select s from Subscription s
            join fetch s.plan
            where s.user.id = :userId and s.deletedAt is null
            """)
    Optional<Subscription> findWithPlanByUserId(@Param("userId") UUID userId);

    /** Id các user đã có subscription — cho seed idempotent (SubscriptionDataInitializer). */
    @Query("select s.user.id from Subscription s where s.deletedAt is null")
    List<UUID> findActiveUserIds();

    /** Toàn bộ subscription kèm plan + user (fetch) — nguồn dòng cho admin per-plan/per-user. */
    @Query("""
            select s from Subscription s
            join fetch s.plan
            join fetch s.user u
            where s.deletedAt is null and u.deletedAt is null
            """)
    List<Subscription> findAllWithPlanAndUser();
}
