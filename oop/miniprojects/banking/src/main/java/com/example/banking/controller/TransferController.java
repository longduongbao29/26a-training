package com.example.banking.controller;

import com.example.banking.model.Account;
import com.example.banking.model.Bank;
import com.example.banking.model.Transaction;
import com.example.banking.repository.AccountRepository;
import com.example.banking.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Handles fund transfers between accounts.
 * Uses Bank.withdraw() and Bank.deposit() — the Bank class is the central
 * domain object delegated to for all balance mutations.
 *
 * Relationship: TransferController DEPENDS ON Bank (calls withdraw/deposit)
 * TransferController DEPENDS ON AccountRepository, TransactionRepository
 */
@RestController
@RequestMapping("/transfers")
public class TransferController {

    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;

    public TransferController(AccountRepository accountRepo,
            TransactionRepository txRepo) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> body, Authentication auth) {
        if (auth == null)
            return ResponseEntity.status(401).build();

        long fromId = Long.parseLong(body.get("fromAccountId").toString());
        long toId = Long.parseLong(body.get("toAccountId").toString());
        float amount = Float.parseFloat(body.get("amount").toString());

        Account from = accountRepo.findById(fromId).orElse(null);
        Account to = accountRepo.findById(toId).orElse(null);

        if (from == null || to == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Account not found"));
        }
        if (!from.getCustomer().getEmail().equals(auth.getName())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not your account"));
        }
        if (from.getId().equals(to.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot transfer to the same account"));
        }

        try {
            Bank bank = resolveBank(from, to);
            bank.withdraw(from, amount);
            bank.deposit(to, amount);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }

        accountRepo.save(from);
        accountRepo.save(to);

        LocalDateTime now = LocalDateTime.now();
        saveTransaction(from, "TRANSFER_OUT", amount, "Chuyển tiền đến " + to.getNumber(), now);
        saveTransaction(to, "TRANSFER_IN", amount, "Nhận tiền từ " + from.getNumber(), now);

        return ResponseEntity.ok(Map.of("message", "Transfer successful"));
    }

    private void saveTransaction(Account account, String type, float amount, String desc, LocalDateTime time) {
        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setDescription(desc);
        tx.setOccurredAt(time);
        txRepo.save(tx);
    }

    private Bank resolveBank(Account from, Account to) {
        if (from.getBank() != null)
            return from.getBank();
        if (to.getBank() != null)
            return to.getBank();
        return new Bank();
    }
}
