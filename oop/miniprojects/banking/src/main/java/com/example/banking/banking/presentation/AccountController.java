package com.example.banking.banking.presentation;

import com.example.banking.banking.application.BankingApplicationService;
import com.example.banking.banking.application.command.DepositCommand;
import com.example.banking.banking.application.command.OpenAccountCommand;
import com.example.banking.banking.application.command.WithdrawCommand;
import com.example.banking.banking.application.dto.AccountLookupDto;
import com.example.banking.banking.application.dto.AccountDto;
import com.example.banking.banking.application.dto.TransactionDto;
import com.example.banking.identity.domain.model.UserId;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final BankingApplicationService bankingService;
    private final CurrentUserResolver currentUserResolver;

    public AccountController(BankingApplicationService bankingService,
                             CurrentUserResolver currentUserResolver) {
        this.bankingService = bankingService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/lookup")
    public ResponseEntity<AccountLookupDto> lookup(@org.springframework.web.bind.annotation.RequestParam String number) {
        return bankingService.lookupByAccountNumber(number)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<AccountDto> listMyAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = currentUserResolver.resolveUserId(userDetails);
        return bankingService.listMyAccounts(userId);
    }

    @PostMapping
    public ResponseEntity<AccountDto> openAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OpenAccountCommand cmd) {
        UUID userId = currentUserResolver.resolveUserId(userDetails);
        AccountDto dto = bankingService.openAccount(UserId.of(userId), cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}")
    public AccountDto getAccount(@PathVariable UUID id) {
        return bankingService.getAccount(id);
    }

    @PostMapping("/{id}/deposit")
    public AccountDto deposit(@PathVariable UUID id,
                              @Valid @RequestBody DepositCommand cmd) {
        return bankingService.deposit(id, cmd);
    }

    @PostMapping("/{id}/withdraw")
    public AccountDto withdraw(@PathVariable UUID id,
                               @Valid @RequestBody WithdrawCommand cmd) {
        return bankingService.withdraw(id, cmd);
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionDto> getTransactions(@PathVariable UUID id) {
        return bankingService.getHistory(id);
    }
}
