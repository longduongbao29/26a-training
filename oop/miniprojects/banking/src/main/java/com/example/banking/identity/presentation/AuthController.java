package com.example.banking.identity.presentation;

import com.example.banking.identity.application.AuthApplicationService;
import com.example.banking.identity.application.command.LoginCommand;
import com.example.banking.identity.application.command.RegisterCommand;
import com.example.banking.identity.application.dto.LoginSessionDto;
import com.example.banking.identity.application.dto.UserDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthApplicationService authService;
    private final UserDetailsService userDetailsService;

    public AuthController(AuthApplicationService authService,
            UserDetailsService userDetailsService) {
        this.authService = authService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterCommand cmd) {
        UserDto dto = authService.register(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginCommand cmd,
            HttpServletRequest request) {
        UserDto dto = authService.login(cmd);

        UserDetails userDetails = userDetailsService.loadUserByUsername(cmd.email());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());
        SecurityContext sc = SecurityContextHolder.createEmptyContext();
        sc.setAuthentication(auth);
        SecurityContextHolder.setContext(sc);

        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

        String ip = resolveClientIp(request);
        String ua = request.getHeader("User-Agent");
        authService.recordLogin(dto.id(), ip, ua, session.getId());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<LoginSessionDto>> sessions(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        UserDto me = authService.getCurrentUser(userDetails.getUsername());
        HttpSession session = request.getSession(false);
        String currentSessionId = session != null ? session.getId() : null;
        List<LoginSessionDto> list = authService.listSessions(me.id(), currentSessionId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            authService.endSession(session.getId());
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    private static String resolveClientIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

}
