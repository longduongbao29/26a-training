package com.example.banking.identity.application.dto;

import com.example.banking.identity.domain.model.User;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String fullName,
        Instant createdAt
) {
    public static UserDto from(User user) {
        return new UserDto(
                user.getId().getId(),
                user.getEmail().getValue(),
                user.getFullName(),
                user.getCreatedAt()
        );
    }
}
