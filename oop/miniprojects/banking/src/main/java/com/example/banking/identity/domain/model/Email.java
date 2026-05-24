package com.example.banking.identity.domain.model;

import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class Email {

    private String value;

    protected Email() {}

    public Email(String value) {
        Objects.requireNonNull(value, "Username cannot be null");
        String trimmed = value.trim().toLowerCase();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }
        this.value = trimmed;
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Email)) return false;
        Email email = (Email) o;
        return Objects.equals(value, email.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
