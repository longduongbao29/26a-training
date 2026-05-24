package com.example.banking.identity.domain.model;

import jakarta.persistence.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "users")
public class User {

    @EmbeddedId
    private UserId id;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", nullable = false, unique = true))
    private Email email;

    @Embedded
    @AttributeOverride(name = "passwordHash", column = @Column(name = "password_hash", nullable = false))
    private HashedPassword password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected User() {}

    private User(UserId id, Email email, HashedPassword password, String fullName, Instant createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }

    public static User register(String email, String rawPassword, String fullName,
                                PasswordEncoder encoder) {
        Objects.requireNonNull(fullName, "Full name cannot be null");
        if (fullName.isBlank()) {
            throw new IllegalArgumentException("Full name cannot be blank");
        }
        HashedPassword hashed = new HashedPassword(encoder.encode(rawPassword));
        return new User(UserId.generate(), new Email(email), hashed, fullName.trim(), Instant.now());
    }

    public boolean matches(String rawPassword, PasswordEncoder encoder) {
        return encoder.matches(rawPassword, password.getPasswordHash());
    }

    public void changePassword(String newRawPassword, PasswordEncoder encoder) {
        this.password = new HashedPassword(encoder.encode(newRawPassword));
    }

    public UserId getId() { return id; }
    public Email getEmail() { return email; }
    public HashedPassword getPassword() { return password; }
    public String getFullName() { return fullName; }
    public Instant getCreatedAt() { return createdAt; }
}
