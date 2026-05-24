package com.example.banking.banking.application;

import com.example.banking.banking.application.command.DepositCommand;
import com.example.banking.banking.application.command.OpenAccountCommand;
import com.example.banking.banking.application.command.TransferCommand;
import com.example.banking.banking.application.command.WithdrawCommand;
import com.example.banking.banking.application.dto.AccountDto;
import com.example.banking.banking.application.dto.AccountLookupDto;
import com.example.banking.banking.application.dto.TransactionDto;
import com.example.banking.banking.domain.model.AccountId;
import com.example.banking.banking.domain.model.BankAccount;
import com.example.banking.banking.domain.model.Money;
import com.example.banking.banking.domain.repository.BankAccountRepository;
import com.example.banking.banking.domain.service.TransferDomainService;
import com.example.banking.identity.domain.model.UserId;
import com.example.banking.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BankingApplicationService {

    private final BankAccountRepository accountRepository;
    private final TransferDomainService transferDomainService;
    private final UserRepository userRepository;

    public BankingApplicationService(BankAccountRepository accountRepository,
                                     TransferDomainService transferDomainService,
                                     UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.transferDomainService = transferDomainService;
        this.userRepository = userRepository;
    }

    public AccountDto openAccount(UserId ownerId, OpenAccountCommand cmd) {
        BankAccount account = BankAccount.open(ownerId, cmd.accountType(), cmd.currencyCode());
        return AccountDto.from(accountRepository.save(account));
    }

    public AccountDto deposit(UUID accountId, DepositCommand cmd) {
        BankAccount account = findAccount(AccountId.of(accountId));
        account.deposit(Money.of(cmd.amount(), cmd.currencyCode()));
        return AccountDto.from(accountRepository.save(account));
    }

    public AccountDto withdraw(UUID accountId, WithdrawCommand cmd) {
        BankAccount account = findAccount(AccountId.of(accountId));
        account.withdraw(Money.of(cmd.amount(), cmd.currencyCode()));
        return AccountDto.from(accountRepository.save(account));
    }

    public void transfer(TransferCommand cmd) {
        BankAccount from = findAccount(AccountId.of(cmd.fromAccountId()));
        BankAccount to = findAccount(AccountId.of(cmd.toAccountId()));
        Money amount = Money.of(cmd.amount(), cmd.currencyCode());
        transferDomainService.transfer(from, to, amount);
        accountRepository.save(from);
        accountRepository.save(to);
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getHistory(UUID accountId) {
        BankAccount account = findAccount(AccountId.of(accountId));
        return account.getTransactions().stream()
                .map(TransactionDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AccountDto> listMyAccounts(UUID userId) {
        return accountRepository.findByOwnerId(UserId.of(userId)).stream()
                .map(AccountDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountDto getAccount(UUID accountId) {
        return AccountDto.from(findAccount(AccountId.of(accountId)));
    }

    @Transactional(readOnly = true)
    public java.util.Optional<AccountLookupDto> lookupByAccountNumber(String raw) {
        String normalized = raw.trim().replace(" ", "-").toUpperCase();
        return accountRepository.findByAccountNumber(normalized).map(acc ->
            userRepository.findById(acc.getOwnerId())
                .map(u -> new AccountLookupDto(acc.getId().getId(), acc.getNumber().getValue(), u.getFullName()))
                .orElse(new AccountLookupDto(acc.getId().getId(), acc.getNumber().getValue(), "Unknown"))
        );
    }

    private BankAccount findAccount(AccountId id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
    }
}
