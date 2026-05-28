package com.example.banking.controller;

import com.example.banking.model.Account;
import com.example.banking.model.Customer;
import com.example.banking.repository.AccountRepository;
import com.example.banking.repository.CustomerRepository;
import com.example.banking.repository.TransactionRepository;
import com.example.banking.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for account operations.
 * Mirrors the AccountController class from the OOP diagram:
 *   - accountList: ArrayList  (in-memory reference for demo)
 *   - addAccount(), editAccount(), removeAccount(), searchAccount()
 *
 * Relationship: AccountController DEPENDS ON Account (manages Account objects)
 *               AccountController DEPENDS ON AccountService (DTO conversion)
 */
@RestController
@RequestMapping("/accounts")
public class AccountController {

    // Mirrors the diagram's "AccountList: ArrayList"
    private final List<Account> accountList = new ArrayList<>();

    private final AccountRepository accountRepo;
    private final CustomerRepository customerRepo;
    private final TransactionRepository txRepo;
    private final AccountService accountService;

    public AccountController(AccountRepository accountRepo,
                             CustomerRepository customerRepo,
                             TransactionRepository txRepo,
                             AccountService accountService) {
        this.accountRepo = accountRepo;
        this.customerRepo = customerRepo;
        this.txRepo = txRepo;
        this.accountService = accountService;
    }

    // ── OOP diagram operations ─────────────────────────────────────────────────

    public void addAccount(Account account) {
        accountRepo.save(account);
        accountList.add(account);
    }

    public void editAccount(Long id, Account updated) {
        accountRepo.findById(id).ifPresent(a -> {
            a.setDescription(updated.getDescription());
            a.setBalanceCurrency(updated.getBalanceCurrency());
            accountRepo.save(a);
        });
    }

    public void removeAccount(Long id) {
        accountRepo.deleteById(id);
        accountList.removeIf(a -> a.getId().equals(id));
    }

    public Account searchAccount(String number) {
        return accountRepo.findByNumber(number).orElse(null);
    }

    // ── REST endpoints (used by the frontend) ─────────────────────────────────

    /** GET /accounts — returns accounts for the authenticated user. */
    @GetMapping
    public ResponseEntity<?> getAccounts(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        return customerRepo.findByEmail(auth.getName())
                .map(c -> {
                    List<Map<String, Object>> dtos = accountRepo
                            .findByCustomerId(c.getId())
                            .stream()
                            .map(accountService::toDto)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(dtos);
                })
                .orElse(ResponseEntity.status(401).build());
    }

    /** GET /accounts/{id}/transactions */
    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getTransactions(@PathVariable Long id, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();

        return accountRepo.findById(id)
                .filter(a -> a.getCustomer().getEmail().equals(auth.getName()))
                .map(a -> {
                    var dtos = txRepo.findByAccountIdOrderByOccurredAtDesc(id)
                            .stream()
                            .map(accountService::toTxDto)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(dtos);
                })
                .orElse(ResponseEntity.status(404).build());
    }

    /** GET /accounts/lookup?number=VN-XXXX-XXXX — used by Transfer screen. */
    @GetMapping("/lookup")
    public ResponseEntity<?> lookup(@RequestParam String number) {
        return accountRepo.findByNumber(number)
                .map(a -> {
                    Customer owner = a.getCustomer();
                    return ResponseEntity.ok(Map.of(
                            "accountId", a.getId(),
                            "accountNumber", a.getNumber(),
                            "ownerName", owner.getName() != null ? owner.getName().toUpperCase() : ""));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
