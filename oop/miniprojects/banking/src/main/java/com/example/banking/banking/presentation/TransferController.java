package com.example.banking.banking.presentation;

import com.example.banking.banking.application.BankingApplicationService;
import com.example.banking.banking.application.command.TransferCommand;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/transfers")
public class TransferController {

    private final BankingApplicationService bankingService;

    public TransferController(BankingApplicationService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> transfer(@Valid @RequestBody TransferCommand cmd) {
        bankingService.transfer(cmd);
        return ResponseEntity.ok(Map.of("message", "Transfer completed successfully"));
    }
}
