package com.example.banking.identity.domain.repository;

import com.example.banking.identity.domain.model.Email;
import com.example.banking.identity.domain.model.User;
import com.example.banking.identity.domain.model.UserId;

import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(UserId id);
    Optional<User> findByEmail(Email email);
    boolean existsByEmail(Email email);
}
