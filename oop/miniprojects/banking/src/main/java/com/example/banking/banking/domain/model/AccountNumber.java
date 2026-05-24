package com.example.banking.banking.domain.model;

import jakarta.persistence.Embeddable;

import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;

@Embeddable
public class AccountNumber {

    private String accountNumber;

    protected AccountNumber() {}

    public AccountNumber(String accountNumber) {
        Objects.requireNonNull(accountNumber, "Account number cannot be null");
        this.accountNumber = accountNumber;
    }

    public static AccountNumber generate() {
        int first = ThreadLocalRandom.current().nextInt(1000, 10000);
        int second = ThreadLocalRandom.current().nextInt(1000, 10000);
        return new AccountNumber("VN-" + first + "-" + second);
    }

    public String getValue() {
        return accountNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AccountNumber)) return false;
        AccountNumber that = (AccountNumber) o;
        return Objects.equals(accountNumber, that.accountNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accountNumber);
    }

    @Override
    public String toString() {
        return accountNumber;
    }
}
