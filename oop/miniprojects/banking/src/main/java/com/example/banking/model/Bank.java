package com.example.banking.model;

import org.springframework.stereotype.Component;

/**
 * Represents the bank entity.
 * Relationship: Bank AGGREGATES Customer (via CustomerController)
 *               Bank USES AccountController for account operations
 */
@Component
public class Bank {

    private int code = 67;
    private String name = "67 Bank";
    private String address = "67 Digital Ave, Ho Chi Minh City";

    public Bank() {}

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    /** Withdraw money from an account. */
    public void withdraw(Account account, float amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        if (account.getBalance() < amount) throw new IllegalStateException("Insufficient balance");
        account.setBalance(account.getBalance() - amount);
    }

    /** Deposit money into an account. */
    public void deposit(Account account, float amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        account.setBalance(account.getBalance() + amount);
    }

    /** Return the current balance of an account. */
    public float checkBalance(Account account) {
        return account.getBalance();
    }
}
