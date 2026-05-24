package com.example.banking.identity.domain.model;

import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class HashedPassword {

    private String passwordHash;

    protected HashedPassword() {}

    public HashedPassword(String passwordHash) {
        this.passwordHash = Objects.requireNonNull(passwordHash, "Password hash cannot be null");
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof HashedPassword)) return false;
        HashedPassword that = (HashedPassword) o;
        return Objects.equals(passwordHash, that.passwordHash);
    }

    @Override
    public int hashCode() {
        return Objects.hash(passwordHash);
    }
}
