package com.example.banking.banking.domain.repository;

import com.example.banking.banking.domain.model.AccountId;
import com.example.banking.banking.domain.model.BankAccount;
import com.example.banking.identity.domain.model.UserId;

import java.util.List;
import java.util.Optional;

public interface BankAccountRepository {
    BankAccount save(BankAccount account);
    Optional<BankAccount> findById(AccountId id);
    Optional<BankAccount> findByAccountNumber(String normalizedNumber);
    List<BankAccount> findByOwnerId(UserId ownerId);
}
