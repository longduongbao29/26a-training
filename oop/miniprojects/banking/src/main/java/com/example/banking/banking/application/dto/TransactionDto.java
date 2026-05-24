package com.example.banking.banking.application.dto;

import com.example.banking.banking.domain.model.Transaction;
import com.example.banking.banking.domain.model.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionDto(
        UUID id,
        UUID accountId,
        TransactionType type,
        BigDecimal amount,
        String currency,
        BigDecimal balanceAfter,
        UUID counterpartyAccountId,
        Instant occurredAt
) {
    public static TransactionDto from(Transaction tx) {
        return new TransactionDto(
                tx.getId(),
                tx.getAccountId().getId(),
                tx.getType(),
                tx.getAmount().getAmount(),
                tx.getAmount().getCurrency(),
                tx.getBalanceAfter().getAmount(),
                tx.getCounterpartyAccountId(),
                tx.getOccurredAt()
        );
    }
}
