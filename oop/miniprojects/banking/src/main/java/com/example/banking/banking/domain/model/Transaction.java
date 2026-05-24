package com.example.banking.banking.domain.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private BankAccount bankAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "tx_type", nullable = false)
    private TransactionType type;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "amount", nullable = false)),
            @AttributeOverride(name = "currency", column = @Column(name = "currency", nullable = false))
    })
    private Money amount;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount", column = @Column(name = "balance_after", nullable = false)),
            // currency is the same column — read-only for balanceAfter
            @AttributeOverride(name = "currency", column = @Column(name = "currency",
                    insertable = false, updatable = false))
    })
    private Money balanceAfter;

    @Column(name = "counterparty_account_id")
    private UUID counterpartyAccountId;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected Transaction() {}

    Transaction(BankAccount bankAccount, TransactionType type, Money amount,
                Money balanceAfter, AccountId counterparty) {
        this.id = UUID.randomUUID();
        this.bankAccount = bankAccount;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.counterpartyAccountId = counterparty != null ? counterparty.getId() : null;
        this.occurredAt = Instant.now();
    }

    public UUID getId() { return id; }

    /** Returns the owning account's ID as a domain VO. */
    public AccountId getAccountId() {
        return bankAccount.getId();
    }

    public TransactionType getType() { return type; }
    public Money getAmount() { return amount; }
    public Money getBalanceAfter() { return balanceAfter; }
    public UUID getCounterpartyAccountId() { return counterpartyAccountId; }
    public Instant getOccurredAt() { return occurredAt; }
}
