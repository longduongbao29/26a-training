package com.example.banking.service;

import com.example.banking.model.Account;
import com.example.banking.model.Transaction;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Utility service: maps domain objects to the JSON shapes the frontend expects.
 * Dependency: AccountService → Account, Transaction models
 */
@Service
public class AccountService {

    /** Converts Account → Map used as JSON response body. */
    public Map<String, Object> toDto(Account account) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", account.getId());
        dto.put("accountNumber", account.getNumber());
        dto.put("balanceAmount", String.valueOf(account.getBalance()));
        dto.put("balanceCurrency", account.getBalanceCurrency());
        dto.put("accountType", account.getAccountType());
        return dto;
    }

    /** Converts Transaction → Map used as JSON response body. */
    public Map<String, Object> toTxDto(Transaction tx) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", tx.getId());
        dto.put("type", tx.getType());
        dto.put("amount", String.valueOf(tx.getAmount()));
        dto.put("occurredAt", tx.getOccurredAt() != null ? tx.getOccurredAt().toString() : null);
        dto.put("accountId", tx.getAccountId());
        dto.put("description", tx.getDescription());
        return dto;
    }
}
