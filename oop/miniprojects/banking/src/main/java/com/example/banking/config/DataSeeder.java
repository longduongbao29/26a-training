package com.example.banking.config;

import com.example.banking.banking.application.BankingApplicationService;
import com.example.banking.banking.application.command.DepositCommand;
import com.example.banking.banking.application.command.OpenAccountCommand;
import com.example.banking.banking.application.dto.AccountDto;
import com.example.banking.banking.domain.model.AccountType;
import com.example.banking.identity.application.AuthApplicationService;
import com.example.banking.identity.application.command.RegisterCommand;
import com.example.banking.identity.application.dto.UserDto;
import com.example.banking.identity.domain.model.Email;
import com.example.banking.identity.domain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

        private final AuthApplicationService authService;
        private final BankingApplicationService bankingService;
        private final UserRepository userRepository;

        public DataSeeder(AuthApplicationService authService,
                        BankingApplicationService bankingService,
                        UserRepository userRepository) {
                this.authService = authService;
                this.bankingService = bankingService;
                this.userRepository = userRepository;
        }

        @Override
        public void run(String... args) {
                String demoEmail = "1";

                if (!userRepository.existsByEmail(new Email(demoEmail))) {
                        log.info("Seeding demo user...");
                        UserDto user = authService.register(new RegisterCommand(demoEmail, "1", "Long1"));

                        java.util.List<com.example.banking.banking.application.dto.AccountDto> accounts = bankingService
                                        .listMyAccounts(user.id());

                        accounts.stream()
                                        .filter(a -> a.accountType() == AccountType.SAVING)
                                        .findFirst()
                                        .ifPresent(a -> bankingService.deposit(a.id(),
                                                        new DepositCommand(new BigDecimal("25000000"), "VND")));

                        accounts.stream()
                                        .filter(a -> a.accountType() == AccountType.CURRENT)
                                        .findFirst()
                                        .ifPresent(a -> bankingService.deposit(a.id(),
                                                        new DepositCommand(new BigDecimal("50000000"), "VND")));

                        log.info("Demo user seeded. Login: {} / 1", demoEmail);
                } else {
                        // Ensure demo user has a CURRENT account (for existing installs)
                        userRepository.findByEmail(new com.example.banking.identity.domain.model.Email(demoEmail))
                                        .ifPresent(u -> {
                                                java.util.List<com.example.banking.banking.application.dto.AccountDto> accounts = bankingService
                                                                .listMyAccounts(u.getId().getId());
                                                boolean hasCurrent = accounts.stream()
                                                                .anyMatch(a -> a.accountType() == AccountType.CURRENT);
                                                if (!hasCurrent) {
                                                        log.info("Adding CURRENT account to demo user...");
                                                        AccountDto cur = bankingService.openAccount(
                                                                        u.getId(),
                                                                        new OpenAccountCommand(AccountType.CURRENT,
                                                                                        "VND"));
                                                        bankingService.deposit(cur.id(),
                                                                        new DepositCommand(new BigDecimal("50000000"),
                                                                                        "VND"));
                                                        log.info("CURRENT account created: {}", cur.accountNumber());
                                                }
                                        });
                }
        }
}
