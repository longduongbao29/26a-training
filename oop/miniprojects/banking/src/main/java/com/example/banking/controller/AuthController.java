package com.example.banking.controller;

import com.example.banking.model.Customer;
import com.example.banking.model.LoginSession;
import com.example.banking.repository.CustomerRepository;
import com.example.banking.repository.LoginSessionRepository;
import com.example.banking.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handles authentication: register, login, me, logout, sessions.
 * Dependency: AuthController → CustomerService, CustomerRepository,
 * LoginSessionRepository
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepo;
    private final LoginSessionRepository sessionRepo;
    private final AuthenticationManager authManager;

    public AuthController(CustomerService customerService,
            CustomerRepository customerRepo,
            LoginSessionRepository sessionRepo,
            AuthenticationManager authManager) {
        this.customerService = customerService;
        this.customerRepo = customerRepo;
        this.sessionRepo = sessionRepo;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            Customer customer = customerService.register(
                    body.get("email"), body.get("password"), body.get("fullName"));
            return ResponseEntity.ok(toUserDto(customer));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.get("email"), body.get("password")));

            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx);

            Customer customer = customerRepo.findByEmail(body.get("email")).orElseThrow();

            // Record login session
            LoginSession ls = new LoginSession();
            ls.setCustomerId((long) customer.getId());
            ls.setUserAgent(request.getHeader("User-Agent"));
            ls.setIpAddress(request.getRemoteAddr());
            ls.setLoginTime(LocalDateTime.now());
            ls.setActive(true);
            sessionRepo.save(ls);

            return ResponseEntity.ok(toUserDto(customer));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return customerRepo.findByEmail(auth.getName())
                .map(c -> ResponseEntity.ok(toUserDto(c)))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, Authentication auth) {
        if (auth != null) {
            customerRepo.findByEmail(auth.getName()).ifPresent(c -> {
                List<LoginSession> active = sessionRepo
                        .findByCustomerIdOrderByLoginTimeDesc((long) c.getId());
                active.stream().filter(LoginSession::isActive).findFirst()
                        .ifPresent(ls -> {
                            ls.setActive(false);
                            ls.setLoggedOutAt(LocalDateTime.now());
                            sessionRepo.save(ls);
                        });
            });
        }
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> sessions(Authentication auth) {
        if (auth == null)
            return ResponseEntity.status(401).build();
        return customerRepo.findByEmail(auth.getName())
                .map(c -> {
                    List<LoginSession> sessions = sessionRepo
                            .findByCustomerIdOrderByLoginTimeDesc((long) c.getId());
                    Long currentId = sessions.stream()
                            .filter(LoginSession::isActive)
                            .max(Comparator.comparing(LoginSession::getLoginTime,
                                    Comparator.nullsLast(Comparator.naturalOrder())))
                            .map(LoginSession::getId)
                            .orElse(null);

                    List<Map<String, Object>> list = sessions.stream()
                            .map(s -> Map.<String, Object>of(
                                    "id", s.getId(),
                                    "userAgent", s.getUserAgent() != null ? s.getUserAgent() : "",
                                    "ipAddress", s.getIpAddress() != null ? s.getIpAddress() : "",
                                    "loggedInAt", s.getLoginTime() != null ? s.getLoginTime().toString() : "",
                                    "loggedOutAt", s.getLoggedOutAt() != null ? s.getLoggedOutAt().toString() : "",
                                    "active", s.isActive(),
                                    "current", s.getId() != null && s.getId().equals(currentId)))
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(list);
                })
                .orElse(ResponseEntity.status(401).build());
    }

    private Map<String, Object> toUserDto(Customer c) {
        return Map.of("id", c.getId(), "email", c.getEmail(), "fullName", c.getName() != null ? c.getName() : "");
    }
}
