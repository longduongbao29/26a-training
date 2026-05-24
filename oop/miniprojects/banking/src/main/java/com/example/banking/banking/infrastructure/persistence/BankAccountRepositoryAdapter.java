package com.example.banking.banking.infrastructure.persistence;

import com.example.banking.banking.domain.model.AccountId;
import com.example.banking.banking.domain.model.BankAccount;
import com.example.banking.banking.domain.repository.BankAccountRepository;
import com.example.banking.identity.domain.model.UserId;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class BankAccountRepositoryAdapter implements BankAccountRepository {

    private final SpringDataBankAccountRepository springData;

    public BankAccountRepositoryAdapter(SpringDataBankAccountRepository springData) {
        this.springData = springData;
    }

    @Override
    public BankAccount save(BankAccount account) {
        return springData.save(account);
    }

    @Override
    public Optional<BankAccount> findById(AccountId id) {
        return springData.findById(id);
    }

    @Override
    public Optional<BankAccount> findByAccountNumber(String normalizedNumber) {
        return springData.findByAccountNumberValue(normalizedNumber);
    }

    @Override
    public List<BankAccount> findByOwnerId(UserId ownerId) {
        return springData.findByOwnerIdValue(ownerId.getId());
    }
}
