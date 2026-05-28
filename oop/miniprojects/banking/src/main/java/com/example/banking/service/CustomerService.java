package com.example.banking.service;

import com.example.banking.model.CurrentAccount;
import com.example.banking.model.Customer;
import com.example.banking.model.SavingAccount;
import com.example.banking.repository.AccountRepository;
import com.example.banking.repository.BankRepository;
import com.example.banking.repository.CustomerRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

/**
 * Handles customer registration and Spring Security authentication.
 * Dependency: CustomerService → CustomerRepository, AccountRepository
 */
@Service
public class CustomerService implements UserDetailsService {

    private final CustomerRepository customerRepo;
    private final AccountRepository accountRepo;
    private final BankRepository bankRepo;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepo,
            AccountRepository accountRepo,
            BankRepository bankRepo,
            PasswordEncoder passwordEncoder) {
        this.customerRepo = customerRepo;
        this.accountRepo = accountRepo;
        this.bankRepo = bankRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Customer customer = customerRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return User.builder()
                .username(customer.getEmail())
                .password(customer.getPassword())
                .roles("USER")
                .build();
    }

    @Transactional
    public Customer register(String email, String password, String fullName) {
        if (customerRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already taken");
        }

        Customer customer = new Customer();
        customer.setName(fullName);
        customer.setEmail(email);
        customer.setUsername(email);
        customer.setPassword(passwordEncoder.encode(password));
        customer = customerRepo.save(customer);

        // Auto-create a CurrentAccount and a SavingAccount for every new customer
        var bank = bankRepo.findTopByOrderByIdAsc().orElseGet(() -> {
            var b = new com.example.banking.model.Bank();
            return bankRepo.save(b);
        });

        CurrentAccount current = new CurrentAccount();
        current.setAccountTitle("Tài khoản thanh toán");
        current.setStatus("ACTIVE");
        current.setNumber(generateAccountNumber());
        current.setBalance(1_000_000f);
        current.setDescription("Tài khoản thanh toán mặc định");
        current.setCustomer(customer);
        current.setBank(bank);
        accountRepo.save(current);

        SavingAccount saving = new SavingAccount();
        saving.setAccountTitle("Tài khoản tiết kiệm");
        saving.setStatus("ACTIVE");
        saving.setNumber(generateAccountNumber());
        saving.setBalance(5_000_000f);
        saving.setDescription("Tài khoản tiết kiệm");
        saving.setInterest(5.0f);
        saving.setCustomer(customer);
        saving.setBank(bank);
        accountRepo.save(saving);

        customer.setCardNo(current.getNumber());
        return customerRepo.save(customer);
    }

    private String generateAccountNumber() {
        Random rng = new Random();
        return String.format("VN-%04d-%04d", rng.nextInt(10000), rng.nextInt(10000));
    }
}
