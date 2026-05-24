package com.example.banking.banking.application.dto;

import java.util.UUID;

public record AccountLookupDto(UUID accountId, String accountNumber, String ownerName) {}
