package com.example.banking.identity.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "login_sessions")
public class LoginSession {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "logged_in_at", nullable = false)
    private LocalDateTime loggedInAt;

    @Column(name = "logged_out_at")
    private LocalDateTime loggedOutAt;

    protected LoginSession() {}

    public static LoginSession create(UUID userId, String ip, String userAgent, String sessionId) {
        LoginSession s = new LoginSession();
        s.id = UUID.randomUUID();
        s.userId = userId;
        s.ipAddress = ip;
        s.userAgent = userAgent;
        s.sessionId = sessionId;
        s.loggedInAt = LocalDateTime.now();
        return s;
    }

    public void end() {
        this.loggedOutAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getSessionId() { return sessionId; }
    public LocalDateTime getLoggedInAt() { return loggedInAt; }
    public LocalDateTime getLoggedOutAt() { return loggedOutAt; }
    public boolean isActive() { return loggedOutAt == null; }
}
