package com.example.banking.banking.application.command;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DepositCommand(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull String currencyCode
) {}
