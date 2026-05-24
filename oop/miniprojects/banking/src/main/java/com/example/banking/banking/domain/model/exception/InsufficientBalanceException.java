package com.example.banking.banking.domain.model.exception;

import com.example.banking.shared.kernel.DomainException;

public class InsufficientBalanceException extends DomainException {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}
