package com.example.banking.banking.presentation;

import com.example.banking.identity.domain.model.Email;
import com.example.banking.identity.domain.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public CurrentUserResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UUID resolveUserId(UserDetails userDetails) {
        Email email = new Email(userDetails.getUsername());
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"))
                .getId()
                .getId();
    }
}
