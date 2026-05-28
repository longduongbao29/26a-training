package com.example.banking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Records a single financial event on an account.
 * Relationship: Transaction is part of Account COMPOSITION
 *               (ManyToOne back to Account).
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** DEPOSIT | WITHDRAW | TRANSFER_IN | TRANSFER_OUT */
    private String type;
    private float amount;
    private LocalDateTime occurredAt;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    public Transaction() {}

    // ── getters / setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public float getAmount() { return amount; }
    public void setAmount(float amount) { this.amount = amount; }

    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }

    public Long getAccountId() { return account != null ? account.getId() : null; }
}
