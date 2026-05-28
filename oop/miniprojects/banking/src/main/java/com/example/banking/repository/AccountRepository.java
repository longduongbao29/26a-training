package com.example.banking.repository;

import com.example.banking.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByCustomerId(int customerId);
    Optional<Account> findByNumber(String number);
}
