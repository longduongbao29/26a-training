CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY,
    account_number VARCHAR(32) NOT NULL UNIQUE,
    owner_id UUID NOT NULL,
    account_type VARCHAR(16) NOT NULL,
    balance_amount NUMERIC(19,4) NOT NULL CHECK (balance_amount >= 0),
    balance_currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_accounts_owner ON bank_accounts(owner_id);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    tx_type VARCHAR(16) NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance_after NUMERIC(19,4) NOT NULL,
    counterparty_account_id UUID NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_tx_account_time ON transactions(account_id, occurred_at DESC);
