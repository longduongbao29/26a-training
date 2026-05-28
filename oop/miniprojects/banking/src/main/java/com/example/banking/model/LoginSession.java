package com.example.banking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/** Tracks each login event for a customer (shown in Sessions screen). */
@Entity
@Table(name = "login_sessions")
public class LoginSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String userAgent;
    private String ipAddress;
    private LocalDateTime loginTime;
    private boolean active = true;

    public LoginSession() {}

    public Long getId() { return id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getLoginTime() { return loginTime; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
