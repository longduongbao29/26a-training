package com.example.banking.banking.infrastructure.persistence;

import com.example.banking.banking.domain.model.AccountId;
import com.example.banking.banking.domain.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringDataBankAccountRepository extends JpaRepository<BankAccount, AccountId> {

    @Query("SELECT a FROM BankAccount a WHERE a.ownerId.id = :ownerId ORDER BY CASE a.type WHEN 'CURRENT' THEN 0 ELSE 1 END, a.createdAt")
    List<BankAccount> findByOwnerIdValue(@Param("ownerId") UUID ownerId);

    @Query("SELECT a FROM BankAccount a WHERE a.number.accountNumber = :number")
    Optional<BankAccount> findByAccountNumberValue(@Param("number") String number);
}
