package com.example.banking.repository;

import com.example.banking.model.Bank;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankRepository extends JpaRepository<Bank, Long> {
    Optional<Bank> findTopByOrderByIdAsc();
}
