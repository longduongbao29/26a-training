package com.example.banking.identity.application.dto;

import com.example.banking.identity.domain.model.LoginSession;

import java.time.LocalDateTime;
import java.util.UUID;

public record LoginSessionDto(
        UUID id,
        String ipAddress,
        String userAgent,
        LocalDateTime loggedInAt,
        LocalDateTime loggedOutAt,
        boolean active,
        boolean current
) {
    public static LoginSessionDto from(LoginSession s, String currentSessionId) {
        boolean isCurrent = currentSessionId != null && currentSessionId.equals(s.getSessionId());
        return new LoginSessionDto(
                s.getId(),
                s.getIpAddress(),
                s.getUserAgent(),
                s.getLoggedInAt(),
                s.getLoggedOutAt(),
                s.isActive(),
                isCurrent
        );
    }
}
