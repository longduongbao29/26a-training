package com.example.banking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A standard current (checking) account.
 * Relationship: CurrentAccount INHERITS Account (IS-A relationship).
 */
@Entity
@DiscriminatorValue("CURRENT")
public class CurrentAccount extends Account {

    private String accountTitle;
    private String status = "ACTIVE";

    public CurrentAccount() {}

    @Override
    public String getAccountType() { return "CURRENT"; }

    @Override
    public void viewAccount() {
        System.out.printf("[CurrentAccount] %s | Balance: %.2f %s | Status: %s%n",
                getNumber(), getBalance(), getBalanceCurrency(), status);
    }

    public String getAccountTitle() { return accountTitle; }
    public void setAccountTitle(String accountTitle) { this.accountTitle = accountTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
