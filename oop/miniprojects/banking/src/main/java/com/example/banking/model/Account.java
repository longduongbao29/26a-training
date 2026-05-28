package com.example.banking.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Abstract base class for all account types.
 * Relationship: Account is the PARENT class (generalization) of
 *               CurrentAccount and SavingAccount.
 *               Account COMPOSES Transaction (1 Account → 0..* Transactions).
 */
@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "account_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String number;      // e.g. VN-1234-5678
    private float balance;
    private String description;
    private String balanceCurrency = "VND";

    // Part of COMPOSITION with Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // COMPOSITION: transactions belong entirely to this account
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("occurredAt DESC")
    private List<Transaction> transactions = new ArrayList<>();

    public Account() {}

    // ── abstract contract ──────────────────────────────────────────────────────

    /** Returns the discriminator string (CURRENT / SAVING). */
    public abstract String getAccountType();

    /** Print account summary (used by demo/console). */
    public abstract void viewAccount();

    // ── getters / setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public float getBalance() { return balance; }
    public void setBalance(float balance) { this.balance = balance; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBalanceCurrency() { return balanceCurrency; }
    public void setBalanceCurrency(String balanceCurrency) { this.balanceCurrency = balanceCurrency; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public List<Transaction> getTransactions() { return transactions; }
}
