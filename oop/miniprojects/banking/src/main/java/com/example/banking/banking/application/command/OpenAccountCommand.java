package com.example.banking.banking.application.command;

import com.example.banking.banking.domain.model.AccountType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OpenAccountCommand(
        @NotNull AccountType accountType,
        @NotNull @Size(min = 3, max = 3) String currencyCode
) {}
