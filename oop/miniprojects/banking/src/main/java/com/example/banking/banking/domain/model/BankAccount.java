package com.example.banking.banking.domain.model;

import com.example.banking.banking.domain.model.exception.InsufficientBalanceException;
import com.example.banking.banking.domain.model.exception.InvalidAmountException;
import com.example.banking.identity.domain.model.UserId;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "bank_accounts")
public class BankAccount {

    @EmbeddedId
    private AccountId id;

    @Embedded
    @AttributeOverride(name = "accountNumber", column = @Column(name = "account_number", nullable = false, unique = true))
    private AccountNumber number;

    @Embedded
    @AttributeOverride(name = "id", column = @Column(name = "owner_id", nullable = false))
    private UserId ownerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType type;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "balance_amount", nullable = false)),
            @AttributeOverride(name = "currency", column = @Column(name = "balance_currency", nullable = false))
    })
    private Money balance;

    @OneToMany(mappedBy = "bankAccount", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    protected BankAccount() {}

    private BankAccount(AccountId id, AccountNumber number, UserId ownerId,
                        AccountType type, Money initialBalance) {
        this.id = id;
        this.number = number;
        this.ownerId = ownerId;
        this.type = type;
        this.balance = initialBalance;
        this.createdAt = Instant.now();
    }

    public static BankAccount open(UserId ownerId, AccountType type, String currencyCode) {
        Objects.requireNonNull(ownerId, "Owner ID cannot be null");
        Objects.requireNonNull(type, "Account type cannot be null");
        return new BankAccount(
                AccountId.generate(),
                AccountNumber.generate(),
                ownerId,
                type,
                Money.zero(currencyCode)
        );
    }

    public void deposit(Money amount) {
        requirePositive(amount);
        this.balance = this.balance.add(amount);
        transactions.add(new Transaction(this, TransactionType.DEPOSIT, amount, this.balance, null));
    }

    public void withdraw(Money amount) {
        requirePositive(amount);
        requireSufficientBalance(amount);
        this.balance = this.balance.subtract(amount);
        transactions.add(new Transaction(this, TransactionType.WITHDRAW, amount, this.balance, null));
    }

    public void debitForTransfer(Money amount, AccountId counterparty) {
        requirePositive(amount);
        requireSufficientBalance(amount);
        this.balance = this.balance.subtract(amount);
        transactions.add(new Transaction(this, TransactionType.TRANSFER_OUT, amount, this.balance, counterparty));
    }

    public void creditForTransfer(Money amount, AccountId counterparty) {
        requirePositive(amount);
        this.balance = this.balance.add(amount);
        transactions.add(new Transaction(this, TransactionType.TRANSFER_IN, amount, this.balance, counterparty));
    }

    private void requirePositive(Money amount) {
        if (!amount.isPositive()) {
            throw new InvalidAmountException("Amount must be positive, was: " + amount);
        }
    }

    private void requireSufficientBalance(Money amount) {
        if (!this.balance.isGreaterThanOrEqual(amount)) {
            throw new InsufficientBalanceException(
                    "Insufficient balance: " + balance + ", needed: " + amount);
        }
    }

    public AccountId getId() { return id; }
    public AccountNumber getNumber() { return number; }
    public UserId getOwnerId() { return ownerId; }
    public AccountType getType() { return type; }
    public Money getBalance() { return balance; }
    public List<Transaction> getTransactions() { return Collections.unmodifiableList(transactions); }
    public Instant getCreatedAt() { return createdAt; }
    public Long getVersion() { return version; }
}
