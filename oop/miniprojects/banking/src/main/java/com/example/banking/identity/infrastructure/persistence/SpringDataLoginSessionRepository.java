package com.example.banking.identity.infrastructure.persistence;

import com.example.banking.identity.domain.model.LoginSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataLoginSessionRepository extends JpaRepository<LoginSession, UUID> {

    @Query("SELECT s FROM LoginSession s WHERE s.userId = :userId ORDER BY s.loggedInAt DESC")
    List<LoginSession> findByUserIdOrderByLoggedInAtDesc(@Param("userId") UUID userId);

    @Query("SELECT s FROM LoginSession s WHERE s.sessionId = :sessionId AND s.loggedOutAt IS NULL ORDER BY s.loggedInAt DESC")
    Optional<LoginSession> findActiveBySessionId(@Param("sessionId") String sessionId);
}
