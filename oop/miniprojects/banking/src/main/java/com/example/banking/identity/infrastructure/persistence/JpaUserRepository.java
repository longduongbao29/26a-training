package com.example.banking.identity.infrastructure.persistence;

import com.example.banking.identity.domain.model.Email;
import com.example.banking.identity.domain.model.User;
import com.example.banking.identity.domain.model.UserId;
import com.example.banking.identity.domain.repository.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaUserRepository extends JpaRepository<User, UserId>, UserRepository {

    @Query("SELECT u FROM User u WHERE u.email.value = :emailValue")
    Optional<User> findByEmailValue(@Param("emailValue") String emailValue);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email.value = :emailValue")
    boolean existsByEmailValue(@Param("emailValue") String emailValue);

    @Override
    default Optional<User> findByEmail(Email email) {
        return findByEmailValue(email.getValue());
    }

    @Override
    default boolean existsByEmail(Email email) {
        return existsByEmailValue(email.getValue());
    }

}
