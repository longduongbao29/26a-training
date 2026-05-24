package com.example.banking.banking.domain.service;

import com.example.banking.banking.domain.model.BankAccount;
import com.example.banking.banking.domain.model.Money;
import org.springframework.stereotype.Service;

@Service
public class TransferDomainService {

    public void transfer(BankAccount from, BankAccount to, Money amount) {
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
        from.debitForTransfer(amount, to.getId());
        to.creditForTransfer(amount, from.getId());
    }
}
