package com.example.banking.identity.application.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterCommand(
        @NotBlank @Size(max = 64) String email,
        @NotBlank @Size(max = 128) String password,
        @NotBlank @Size(max = 255) String fullName
) {}
