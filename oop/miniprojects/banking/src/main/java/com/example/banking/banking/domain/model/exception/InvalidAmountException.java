package com.example.banking.banking.domain.model.exception;

import com.example.banking.shared.kernel.DomainException;

public class InvalidAmountException extends DomainException {
    public InvalidAmountException(String message) {
        super(message);
    }
}
