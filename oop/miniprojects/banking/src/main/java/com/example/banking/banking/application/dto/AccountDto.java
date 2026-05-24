package com.example.banking.banking.application.dto;

import com.example.banking.banking.domain.model.AccountType;
import com.example.banking.banking.domain.model.BankAccount;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountDto(
        UUID id,
        String accountNumber,
        UUID ownerId,
        AccountType accountType,
        BigDecimal balanceAmount,
        String balanceCurrency,
        Instant createdAt
) {
    public static AccountDto from(BankAccount account) {
        return new AccountDto(
                account.getId().getId(),
                account.getNumber().getValue(),
                account.getOwnerId().getId(),
                account.getType(),
                account.getBalance().getAmount(),
                account.getBalance().getCurrency(),
                account.getCreatedAt()
        );
    }
}
