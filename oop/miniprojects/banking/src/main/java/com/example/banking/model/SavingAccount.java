package com.example.banking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * A savings account that earns interest.
 * Relationship: SavingAccount INHERITS Account (IS-A relationship).
 */
@Entity
@DiscriminatorValue("SAVING")
public class SavingAccount extends Account {

    private String accountTitle;
    private String status = "ACTIVE";
    private float interest = 5.0f;   // annual interest rate (%)

    public SavingAccount() {}

    @Override
    public String getAccountType() { return "SAVING"; }

    @Override
    public void viewAccount() {
        System.out.printf("[SavingAccount] %s | Balance: %.2f %s | Rate: %.1f%% | Status: %s%n",
                getNumber(), getBalance(), getBalanceCurrency(), interest, status);
    }

    /** Calculates simple annual interest on current balance. */
    public float calculateInterest() {
        return getBalance() * interest / 100.0f;
    }

    public String getAccountTitle() { return accountTitle; }
    public void setAccountTitle(String accountTitle) { this.accountTitle = accountTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public float getInterest() { return interest; }
    public void setInterest(float interest) { this.interest = interest; }
}
