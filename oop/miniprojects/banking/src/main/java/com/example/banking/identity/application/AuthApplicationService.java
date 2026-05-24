package com.example.banking.identity.application;

import com.example.banking.banking.application.BankingApplicationService;
import com.example.banking.banking.application.command.OpenAccountCommand;
import com.example.banking.banking.domain.model.AccountType;
import com.example.banking.identity.application.command.LoginCommand;
import com.example.banking.identity.application.command.RegisterCommand;
import com.example.banking.identity.application.dto.LoginSessionDto;
import com.example.banking.identity.application.dto.UserDto;
import com.example.banking.identity.domain.model.Email;
import com.example.banking.identity.domain.model.LoginSession;
import com.example.banking.identity.domain.model.User;
import com.example.banking.identity.domain.model.UserId;
import com.example.banking.identity.domain.repository.UserRepository;
import com.example.banking.identity.infrastructure.persistence.SpringDataLoginSessionRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuthApplicationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BankingApplicationService bankingService;
    private final SpringDataLoginSessionRepository sessionRepository;

    public AuthApplicationService(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  BankingApplicationService bankingService,
                                  SpringDataLoginSessionRepository sessionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bankingService = bankingService;
        this.sessionRepository = sessionRepository;
    }

    public UserDto register(RegisterCommand cmd) {
        Email email = new Email(cmd.email());
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Username already taken: " + cmd.email());
        }
        User user = User.register(cmd.email(), cmd.password(), cmd.fullName(), passwordEncoder);
        UserDto saved = UserDto.from(userRepository.save(user));
        UserId uid = UserId.of(saved.id());

        bankingService.openAccount(uid, new OpenAccountCommand(AccountType.CURRENT, "VND"));
        bankingService.openAccount(uid, new OpenAccountCommand(AccountType.SAVING, "VND"));

        return saved;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        Email email = new Email(username);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public UserDto login(LoginCommand cmd) {
        Email email = new Email(cmd.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!user.matches(cmd.password(), passwordEncoder)) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return UserDto.from(user);
    }

    public void recordLogin(java.util.UUID userId, String ip, String userAgent, String sessionId) {
        sessionRepository.save(LoginSession.create(userId, ip, userAgent, sessionId));
    }

    public void endSession(String sessionId) {
        sessionRepository.findActiveBySessionId(sessionId)
                .ifPresent(s -> { s.end(); sessionRepository.save(s); });
    }

    @Transactional(readOnly = true)
    public List<LoginSessionDto> listSessions(java.util.UUID userId, String currentSessionId) {
        return sessionRepository.findByUserIdOrderByLoggedInAtDesc(userId)
                .stream().map(s -> LoginSessionDto.from(s, currentSessionId)).toList();
    }
}
