# Banking MVP — DDD Design Document

> Mini Project OOP (dựa trên Mini Project 1 — Bank Management System, `OOP_MiniProjects_2022_EN.pdf`)
> Stack: Java 17+ · Spring Boot · Spring Data JPA · PostgreSQL/MySQL · Thymeleaf
> Mục tiêu: kiến trúc sạch theo DDD + Clean Architecture + Layered, không over-engineering.

---

## Mục lục
1. [System Architecture Overview](#1-system-architecture-overview)
2. [DDD Analysis](#2-ddd-analysis)
3. [Class Model — Attributes & Operations](#3-class-model--attributes--operations)
4. [Class Diagram (PlantUML)](#4-class-diagram-plantuml)
5. [Giải thích các mối quan hệ](#5-giải-thích-các-mối-quan-hệ)
6. [Package Structure](#6-package-structure)
7. [Database Schema](#7-database-schema)
8. [API Design](#8-api-design)
9. [Luồng xử lý Transfer Money](#9-luồng-xử-lý-transfer-money)
10. [Sample Code](#10-sample-code)
11. [Roadmap Implementation](#11-roadmap-implementation)
12. [Kết nối DB & chạy project](#12-kết-nối-db--chạy-project)
13. [Tóm tắt tư duy DDD cốt lõi](#13-tóm-tắt-tư-duy-ddd-cốt-lõi)

---

# 1. System Architecture Overview

## 1.1. Triết lý thiết kế

Yêu cầu gốc trong PDF rất "CRUD-style" (Controller giữ ArrayList, addX/editX/removeX). Đây là kiểu **anemic domain model** — model rỗng, business logic nằm rải rác. DDD đảo lại:

- Đẩy **business rule vào trong Entity/Aggregate** (`account.deposit(money)` chứ không phải `service.deposit(account, amount)`).
- Tách **Value Object** cho các khái niệm không có identity (Money, Email, AccountNumber).
- Dùng **Aggregate Root** để bảo vệ invariant (balance không bao giờ âm).

## 1.2. Sơ đồ kiến trúc tổng (Clean Architecture + Layered)

```
┌──────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER   (Controllers + Thymeleaf views)    │
│  - AuthController, AccountController, TransferController │
├──────────────────────────────────────────────────────────┤
│  APPLICATION LAYER    (Use cases / orchestration)        │
│  - AuthApplicationService                                │
│  - BankingApplicationService                             │
│  - DTOs, mappers, @Transactional boundary                │
├──────────────────────────────────────────────────────────┤
│  DOMAIN LAYER         (Trái tim — không phụ thuộc gì)    │
│  - Aggregates: User, BankAccount (root)                  │
│  - Entities: Transaction                                 │
│  - Value Objects: Money, AccountNumber, AccountId,       │
│    UserId, Email, HashedPassword                         │
│  - Enums: AccountType, TransactionType                   │
│  - Domain Services: TransferDomainService                │
│  - Repository INTERFACES (port)                          │
│  - Domain Events (optional)                              │
├──────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER (Adapters — implement port)        │
│  - JpaUserRepository, JpaBankAccountRepository           │
│  - Spring Security config, PasswordEncoder               │
│  - DB migrations (Flyway)                                │
└──────────────────────────────────────────────────────────┘
```

**Dependency Rule:** mũi tên phụ thuộc luôn **chỉ vào trong**. Domain không biết Spring, JPA, HTTP. Infrastructure implement interface của Domain → **Dependency Inversion**.

---

# 2. DDD Analysis

## 2.1. Bounded Contexts

Với mini project, đề xuất **2 bounded context** trong cùng 1 monolith:

| Context | Trách nhiệm | Tại sao tách? |
|---|---|---|
| **Identity Context** | User, đăng ký, đăng nhập, đăng xuất, password | Ngôn ngữ riêng (credential, role), thay đổi vì lý do bảo mật. |
| **Banking Context** | BankAccount, Transaction, deposit, transfer, balance | Ngôn ngữ tài chính (Money, Balance, Ledger). Thay đổi vì lý do nghiệp vụ. |

**Điểm nối:** chỉ qua **`UserId`** (value reference). Banking context KHÔNG import class `User` từ Identity. Đây là **Context Map** dạng *Customer-Supplier*.

> **Why không tách Transaction thành context riêng?** Transaction thuộc lifecycle của BankAccount — tách ra sẽ phải distributed transaction, over-engineering.

## 2.2. Entities vs Value Objects

**Entity** = có identity (id) + lifecycle. **Value Object** = không identity, immutable, so sánh bằng giá trị.

| Tên | Loại | Lý do |
|---|---|---|
| `User` | Aggregate Root (Entity) | Có UserId, lifecycle riêng |
| `BankAccount` | Aggregate Root (Entity) | Có AccountId, balance thay đổi theo thời gian |
| `Transaction` | Entity (thuộc Aggregate BankAccount) | Có TransactionId, nhưng không sống ngoài BankAccount |
| `Money` | Value Object | `Money(100, VND)` immutable |
| `AccountNumber` | Value Object | Định dạng `"VN-0000-1234"`, immutable |
| `AccountId` / `UserId` | Value Object | Wrap UUID, type-safe |
| `Email` | Value Object | Validate format khi tạo |
| `HashedPassword` | Value Object | Encapsulate hash logic |

## 2.3. Aggregates

### Aggregate 1 — `User` (root)
- Members: chỉ `User`.
- Invariants: email unique, password phải là `HashedPassword` (không plain text).

### Aggregate 2 — `BankAccount` (root) — quan trọng nhất
- Members: `BankAccount` (root) + collection `Transaction` (child entity).
- **Invariants:**
  1. `balance >= 0` (không cho phép âm).
  2. Mỗi `Transaction` thuộc đúng 1 account, không di chuyển sang account khác.
  3. `accountNumber` không đổi sau khi tạo.
  4. Mọi thay đổi `balance` phải đi qua method của `BankAccount` (không có `setBalance`).
  5. Mỗi transaction phải ghi `balanceAfter` đúng với balance sau khi cộng/trừ.

> **Why aggregate?** Aggregate = **đơn vị transactional consistency**. Khi `deposit()` chạy, balance và transaction list phải cập nhật atomic — 1 aggregate = 1 transaction DB = 1 `@Transactional`.

## 2.4. Domain Services

- **`TransferDomainService.transfer(from, to, amount)`**: chuyển tiền giữa 2 BankAccount. Là domain service vì logic này liên quan **2 aggregate** — không account nào "sở hữu" nó.

> **Khác Application Service:** Application Service điều phối (mở transaction, gọi repo, gọi domain). Domain Service chứa **business rule thuần** (không biết `@Transactional`, không biết DB).

## 2.5. Repositories

Interface ở **Domain**, implementation ở **Infrastructure** (Dependency Inversion).

## 2.6. Application Services

| Service | Use case |
|---|---|
| `AuthApplicationService` | `register(cmd)`, `login(cmd)`, `logout()` |
| `BankingApplicationService` | `openAccount(cmd)`, `deposit(cmd)`, `transfer(cmd)`, `getBalance(id)`, `getHistory(id)` |

Mỗi method = 1 use case, gắn `@Transactional`, nhận Command DTO, trả Result DTO.

## 2.7. Domain Events (optional)

- `MoneyDepositedEvent(accountId, amount, at)`
- `MoneyTransferredEvent(fromId, toId, amount, at)`

Dùng `ApplicationEventPublisher` của Spring — KHÔNG cần Kafka. Có thể skip cho V1.

---

# 3. Class Model — Attributes & Operations

> Đây là cấu trúc đã model trong Astah. Mỗi class liệt kê attribute (`-` private) và operation (`+` public).

## 3.1. Identity Context

### `User` «AggregateRoot»
```
- id          : UserId
- email       : Email
- password    : HashedPassword
- fullName    : String
- createdAt   : Instant
+ register(email, rawPwd, encoder) : User    [static factory]
+ matches(rawPwd, encoder)          : boolean
+ changePassword(old, new, encoder) : void
```

### `UserId` «ValueObject»
```
- value : UUID
```

### `Email` «ValueObject»
```
- value : String     // validated regex khi construct
```

### `HashedPassword` «ValueObject»
```
- hash : String      // BCrypt hash, không bao giờ là plain text
```

## 3.2. Banking Context

### `BankAccount` «AggregateRoot»
```
- id            : AccountId
- number        : AccountNumber
- ownerId       : UserId          // reference cross-aggregate by ID
- type          : AccountType
- balance       : Money
- transactions  : List<Transaction>   [composition, 0..*]
- version       : long            // optimistic lock

+ open(ownerId, number, type, currency) : BankAccount   [static factory]
+ deposit(amount: Money)                : void
+ withdraw(amount: Money)               : void
+ transferTo(target: BankAccount, amount: Money) : void
+ balance()                             : Money
+ history()                             : List<Transaction>
```

### `Transaction` «Entity»
```
- id             : UUID
- type           : TransactionType
- amount         : Money
- balanceAfter   : Money
- occurredAt     : Instant
```

### `Money` «ValueObject»
```
- amount   : BigDecimal
- currency : Currency

+ add(other: Money)              : Money
+ subtract(other: Money)         : Money
+ isPositive()                   : boolean
+ isGreaterThanOrEqual(other)    : boolean
```

### `AccountId` «ValueObject»
```
- value : UUID
```

### `AccountNumber` «ValueObject»
```
- value : String     // e.g. "VN-0000-1234"
```

### `AccountType` «enumeration»
```
SAVING, CURRENT
```

### `TransactionType` «enumeration»
```
DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT
```

### `TransferDomainService` «DomainService»
```
+ transfer(from: BankAccount, to: BankAccount, amount: Money) : void
```

### `BankAccountRepository` «interface» (port — domain layer)
```
+ findById(id: AccountId)              : Optional<BankAccount>
+ findByNumber(no: AccountNumber)      : Optional<BankAccount>
+ findByOwner(ownerId: UserId)         : List<BankAccount>
+ save(account: BankAccount)           : BankAccount
```

### `JpaBankAccountRepository` (adapter — infrastructure layer)
```
implements BankAccountRepository
```

### `BankingApplicationService` «ApplicationService»
```
+ openAccount(cmd: OpenAccountCommand) : AccountDto
+ deposit(cmd: DepositCommand)         : void
+ transfer(cmd: TransferCommand)       : void
+ getHistory(accountId: UUID)          : List<TransactionDto>
```

---

# 4. Class Diagram (PlantUML)

Paste vào https://plantuml.com hoặc draw.io.

```plantuml
@startuml BankingDDD
skinparam classAttributeIconSize 0
hide empty members

' ============ IDENTITY CONTEXT ============
package "identity" {
  class User <<AggregateRoot>> {
    - id : UserId
    - email : Email
    - password : HashedPassword
    - fullName : String
    - createdAt : Instant
    + register() : User
    + matches() : boolean
  }
  class UserId <<ValueObject>>          { - value : UUID }
  class Email <<ValueObject>>           { - value : String }
  class HashedPassword <<ValueObject>>  { - hash : String }

  User *-- "1" UserId
  User *-- "1" Email
  User *-- "1" HashedPassword
}

' ============ BANKING CONTEXT ============
package "banking" {
  class BankAccount <<AggregateRoot>> {
    - id : AccountId
    - number : AccountNumber
    - ownerId : UserId
    - type : AccountType
    - balance : Money
    - version : long
    + deposit(amount: Money) : void
    + withdraw(amount: Money) : void
    + transferTo(target, amount) : void
    + balance() : Money
    + history() : List<Transaction>
  }
  class Transaction <<Entity>> {
    - id : UUID
    - type : TransactionType
    - amount : Money
    - balanceAfter : Money
    - occurredAt : Instant
  }
  class Money <<ValueObject>> {
    - amount : BigDecimal
    - currency : Currency
    + add(other) : Money
    + subtract(other) : Money
    + isPositive() : boolean
  }
  class AccountId <<ValueObject>>      { - value : UUID }
  class AccountNumber <<ValueObject>>  { - value : String }
  enum AccountType                     { SAVING\nCURRENT }
  enum TransactionType                 { DEPOSIT\nWITHDRAW\nTRANSFER_IN\nTRANSFER_OUT }

  class TransferDomainService <<DomainService>> {
    + transfer(from, to, amount) : void
  }

  interface BankAccountRepository {
    + findById(id) : Optional<BankAccount>
    + findByNumber(no) : Optional<BankAccount>
    + findByOwner(ownerId) : List<BankAccount>
    + save(account) : BankAccount
  }

  class JpaBankAccountRepository
  class BankingApplicationService <<ApplicationService>> {
    + openAccount(cmd) : AccountDto
    + deposit(cmd) : void
    + transfer(cmd) : void
    + getHistory(id) : List<TransactionDto>
  }

  ' Aggregate composition
  BankAccount "1" *-- "0..*" Transaction
  BankAccount *-- "1" AccountId
  BankAccount *-- "1" AccountNumber
  BankAccount *-- "1" Money : balance
  BankAccount --> AccountType
  Transaction *-- "1" Money
  Transaction --> TransactionType

  ' Cross-aggregate reference by ID
  BankAccount --> UserId

  ' Dependencies
  TransferDomainService ..> BankAccount
  BankingApplicationService ..> TransferDomainService
  BankingApplicationService ..> BankAccountRepository
  BankingApplicationService ..> BankAccount

  ' Realization (DIP)
  JpaBankAccountRepository ..|> BankAccountRepository
}

@enduml
```

---

# 5. Giải thích các mối quan hệ

Bảng quan hệ trong UML — **rất quan trọng cho báo cáo OOP**.

| Quan hệ | Notation | Ví dụ trong design | Ý nghĩa |
|---|---|---|---|
| **Composition** ◆ | `A *-- B` | `BankAccount *-- Transaction` | Whole-part **mạnh**. B KHÔNG tồn tại nếu A bị xoá. Lifecycle ràng buộc. Đây là dấu hiệu của Aggregate. |
| **Composition (VO)** | `User *-- Email`, `BankAccount *-- Money` | VO là một phần không tách rời — không có Email thì User không hợp lệ. |
| **Aggregation** ◇ | `A o-- B` | (không dùng) | Whole-part **yếu**, B có thể tồn tại độc lập. Trong banking design này ta tránh aggregation để rõ ràng. |
| **Association** | `A --> B` | `BankAccount --> UserId`, `Transaction --> TransactionType` | "Biết về nhau" nhưng không sở hữu. BankAccount giữ `UserId` để biết chủ — không sở hữu User. **Liên kết qua ID giữa các aggregate.** |
| **Dependency** | `A ..> B` | `TransferDomainService ..> BankAccount`, `AppService ..> Repository` | A "dùng" B (parameter, return type, local var) — quan hệ yếu nhất. |
| **Realization** | `A ..\|> I` | `JpaBankAccountRepository ..\|> BankAccountRepository` | Implement interface. Đây là **Dependency Inversion** (D trong SOLID). |
| **Generalization** | `A --\|> B` | (không dùng — đã ưu tiên composition over inheritance) | Inheritance. |

### Nguyên tắc DDD áp dụng vào quan hệ:
1. **Giữa 2 aggregate → chỉ tham chiếu qua ID, không phải object reference.** Đó là lý do `BankAccount` giữ `UserId` thay vì `User`. Khi load BankAccount, không kéo theo User → tránh transaction lớn, tránh consistency boundary bị nhoè.
2. **Trong 1 aggregate → composition đầy đủ.** `BankAccount` giữ trực tiếp list `Transaction` vì cùng aggregate.
3. **Value Object luôn là composition.** Không có chuyện `Email` "sống độc lập".
4. **Domain Service phụ thuộc (dependency) vào Aggregate, không sở hữu.** Domain Service không có state.
5. **Application Service phụ thuộc vào Repository interface, không phải JPA impl.** → đảo phụ thuộc.

---

# 6. Package Structure

Tổ chức **package by feature** (DDD-style), không phải package by layer.

```
com.example.banking
├── BankingApplication.java                  // @SpringBootApplication
│
├── identity/                                // BOUNDED CONTEXT 1
│   ├── domain/
│   │   ├── model/
│   │   │   ├── User.java                    // Aggregate Root
│   │   │   ├── UserId.java                  // VO
│   │   │   ├── Email.java                   // VO
│   │   │   └── HashedPassword.java          // VO
│   │   └── repository/UserRepository.java   // interface
│   ├── application/
│   │   ├── AuthApplicationService.java
│   │   ├── command/{RegisterCommand,LoginCommand}.java
│   │   └── dto/UserDto.java
│   ├── infrastructure/
│   │   ├── persistence/JpaUserRepository.java
│   │   └── security/{SecurityConfig,PasswordEncoder}.java
│   └── presentation/AuthController.java
│
├── banking/                                 // BOUNDED CONTEXT 2
│   ├── domain/
│   │   ├── model/
│   │   │   ├── BankAccount.java             // Aggregate Root
│   │   │   ├── Transaction.java             // Child entity
│   │   │   ├── AccountId.java               // VO
│   │   │   ├── AccountNumber.java           // VO
│   │   │   ├── AccountType.java             // enum
│   │   │   ├── Money.java                   // VO
│   │   │   ├── Currency.java                // VO/enum
│   │   │   ├── TransactionType.java         // enum
│   │   │   └── exception/
│   │   │       ├── InsufficientBalanceException.java
│   │   │       └── InvalidAmountException.java
│   │   ├── service/TransferDomainService.java
│   │   ├── event/{MoneyDepositedEvent,MoneyTransferredEvent}.java
│   │   └── repository/BankAccountRepository.java
│   ├── application/
│   │   ├── BankingApplicationService.java
│   │   ├── command/{OpenAccountCommand,DepositCommand,TransferCommand}.java
│   │   └── dto/{AccountDto,TransactionDto}.java
│   ├── infrastructure/
│   │   └── persistence/JpaBankAccountRepository.java
│   └── presentation/{AccountController,TransferController}.java
│
└── shared/
    ├── exception/GlobalExceptionHandler.java
    └── kernel/DomainException.java
```

---

# 7. Database Schema (PostgreSQL)

```sql
-- IDENTITY CONTEXT
CREATE TABLE users (
    id            UUID PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- BANKING CONTEXT
CREATE TABLE bank_accounts (
    id               UUID PRIMARY KEY,
    account_number   VARCHAR(32)   NOT NULL UNIQUE,
    owner_id         UUID          NOT NULL,
    account_type     VARCHAR(16)   NOT NULL,
    balance_amount   NUMERIC(19,4) NOT NULL CHECK (balance_amount >= 0),
    balance_currency CHAR(3)       NOT NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT now(),
    version          BIGINT        NOT NULL DEFAULT 0
);
CREATE INDEX idx_accounts_owner ON bank_accounts(owner_id);

CREATE TABLE transactions (
    id                       UUID PRIMARY KEY,
    account_id               UUID         NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    tx_type                  VARCHAR(16)  NOT NULL,
    amount                   NUMERIC(19,4) NOT NULL,
    currency                 CHAR(3)      NOT NULL,
    balance_after            NUMERIC(19,4) NOT NULL,
    counterparty_account_id  UUID         NULL,
    occurred_at              TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_account_time ON transactions(account_id, occurred_at DESC);
```

> **`CHECK (balance_amount >= 0)`:** defense in depth — nếu code bug, DB vẫn từ chối balance âm.
> **`version`:** dùng cho `@Version` (optimistic lock) — chống race condition khi 2 request deposit cùng lúc.
> **No cross-context FK:** trong DDD strict, `bank_accounts.owner_id` KHÔNG FK đến `users.id` — bounded context "không biết" nhau ở DB level. Mini project có thể thêm FK cho an toàn.

---

# 8. API Design

| Method | URL | Body | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | `{email, password, fullName}` | Đăng ký |
| POST | `/auth/login` | `{email, password}` | Login |
| POST | `/auth/logout` | — | Logout |
| GET  | `/accounts` | — | List account của user hiện tại |
| POST | `/accounts` | `{type, currency}` | Mở account mới |
| GET  | `/accounts/{id}` | — | Chi tiết + balance |
| POST | `/accounts/{id}/deposit` | `{amount, currency}` | Nạp tiền |
| POST | `/transfers` | `{fromAccountId, toAccountNumber, amount, currency}` | Chuyển tiền |
| GET  | `/accounts/{id}/transactions` | — | Lịch sử giao dịch |

---

# 9. Luồng xử lý Transfer Money

```
[Browser]
   │ POST /transfers {from, toNumber, amount}
   ▼
[TransferController]                                ← Presentation
   │ TransferRequest → TransferCommand
   ▼
[BankingApplicationService.transfer(cmd)]           ← Application
   │ @Transactional opens here
   │ 1. fromAccount = repo.findById(from)
   │ 2. toAccount   = repo.findByNumber(toNumber)
   │ 3. transferService.transfer(fromAccount, toAccount, money)
   ▼
[TransferDomainService.transfer]                    ← Domain
   │ 4. fromAccount.withdraw(money)
   │      └─ INVARIANT: balance >= amount  → else throw
   │      └─ balance = balance.subtract(money)
   │      └─ transactions.add(Transaction(TRANSFER_OUT, ...))
   │ 5. toAccount.deposit(money)
   │      └─ balance = balance.add(money)
   │      └─ transactions.add(Transaction(TRANSFER_IN, ...))
   │ 6. (optional) raise MoneyTransferredEvent
   ▼
[Back to AppService]
   │ 7. repo.save(fromAccount); repo.save(toAccount)
   │ 8. publish event
   │ @Transactional commits  ← all or nothing
   ▼
[Controller] returns redirect / view
```

**Điểm quan trọng:**
- Business rule (balance check, balance update, tạo Transaction) **nằm trong domain**.
- `@Transactional` ở **Application Layer**, không ở Domain.
- Nếu một bước fail → rollback toàn bộ.

---

# 10. Sample Code

## 10.1. Value Object — `Money`

```java
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;

    private Money(BigDecimal amount, Currency currency) {
        if (amount == null || currency == null) throw new IllegalArgumentException("null");
        this.amount = amount.setScale(4, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    public static Money of(BigDecimal amount, Currency c) { return new Money(amount, c); }
    public static Money zero(Currency c) { return new Money(BigDecimal.ZERO, c); }

    public Money add(Money o)      { same(o); return new Money(amount.add(o.amount), currency); }
    public Money subtract(Money o) { same(o); return new Money(amount.subtract(o.amount), currency); }
    public boolean isGreaterThanOrEqual(Money o) { same(o); return amount.compareTo(o.amount) >= 0; }
    public boolean isPositive() { return amount.compareTo(BigDecimal.ZERO) > 0; }

    private void same(Money o) {
        if (!currency.equals(o.currency)) throw new IllegalArgumentException("Currency mismatch");
    }

    @Override public boolean equals(Object o) {
        return o instanceof Money m && amount.compareTo(m.amount) == 0 && currency.equals(m.currency);
    }
    @Override public int hashCode() { return Objects.hash(amount.stripTrailingZeros(), currency); }
}
```

VO chuẩn: `final` class, **immutable**, **value equality**, **self-validating**.

## 10.2. Aggregate Root — `BankAccount`

```java
@Entity
@Table(name = "bank_accounts")
public class BankAccount {
    @EmbeddedId private AccountId id;
    @Embedded   private AccountNumber number;
    @Embedded   private UserId ownerId;
    @Enumerated(EnumType.STRING) private AccountType type;
    @Embedded   private Money balance;

    @OneToMany(mappedBy = "accountId", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("occurredAt DESC")
    private List<Transaction> transactions = new ArrayList<>();

    @Version private long version;

    protected BankAccount() {}  // JPA

    public static BankAccount open(UserId owner, AccountNumber number,
                                   AccountType type, Currency currency) {
        BankAccount a = new BankAccount();
        a.id = AccountId.newId();
        a.number = number;
        a.ownerId = owner;
        a.type = type;
        a.balance = Money.zero(currency);
        return a;
    }

    public void deposit(Money amount) {
        if (!amount.isPositive()) throw new InvalidAmountException("> 0");
        balance = balance.add(amount);
        transactions.add(Transaction.of(id, TransactionType.DEPOSIT, amount, balance, null));
    }

    public void withdraw(Money amount) {
        if (!amount.isPositive()) throw new InvalidAmountException("> 0");
        if (!balance.isGreaterThanOrEqual(amount)) throw new InsufficientBalanceException(id);
        balance = balance.subtract(amount);
        transactions.add(Transaction.of(id, TransactionType.WITHDRAW, amount, balance, null));
    }

    void debitForTransfer(Money amount, AccountId counterparty) {
        if (!balance.isGreaterThanOrEqual(amount)) throw new InsufficientBalanceException(id);
        balance = balance.subtract(amount);
        transactions.add(Transaction.of(id, TransactionType.TRANSFER_OUT, amount, balance, counterparty));
    }
    void creditForTransfer(Money amount, AccountId counterparty) {
        balance = balance.add(amount);
        transactions.add(Transaction.of(id, TransactionType.TRANSFER_IN, amount, balance, counterparty));
    }

    public AccountId id()          { return id; }
    public Money balance()         { return balance; }
    public List<Transaction> history() { return Collections.unmodifiableList(transactions); }
}
```

- **KHÔNG có `setBalance()`** → invariant không bao giờ bị bypass.
- `debitForTransfer/creditForTransfer` để **package-private** → chỉ `TransferDomainService` cùng package gọi được.

## 10.3. Domain Service — `TransferDomainService`

```java
@Service
public class TransferDomainService {
    public void transfer(BankAccount from, BankAccount to, Money amount) {
        if (from.id().equals(to.id())) throw new IllegalArgumentException("Same account");
        if (!amount.isPositive())      throw new InvalidAmountException("> 0");
        from.debitForTransfer(amount, to.id());
        to.creditForTransfer(amount, from.id());
    }
}
```

## 10.4. Repository — port + adapter

```java
// domain
public interface BankAccountRepository {
    Optional<BankAccount> findById(AccountId id);
    Optional<BankAccount> findByNumber(AccountNumber n);
    List<BankAccount> findByOwner(UserId ownerId);
    BankAccount save(BankAccount a);
}

// infrastructure
interface SpringDataBankAccountRepo extends JpaRepository<BankAccount, AccountId> {
    Optional<BankAccount> findByNumber(AccountNumber n);
    List<BankAccount> findByOwnerId(UserId ownerId);
}

@Component
public class JpaBankAccountRepository implements BankAccountRepository {
    private final SpringDataBankAccountRepo jpa;
    public JpaBankAccountRepository(SpringDataBankAccountRepo jpa) { this.jpa = jpa; }
    public Optional<BankAccount> findById(AccountId id)            { return jpa.findById(id); }
    public Optional<BankAccount> findByNumber(AccountNumber n)     { return jpa.findByNumber(n); }
    public List<BankAccount> findByOwner(UserId o)                 { return jpa.findByOwnerId(o); }
    public BankAccount save(BankAccount a)                         { return jpa.save(a); }
}
```

## 10.5. Application Service

```java
@Service
public class BankingApplicationService {
    private final BankAccountRepository accounts;
    private final TransferDomainService transferService;
    private final ApplicationEventPublisher events;

    public BankingApplicationService(BankAccountRepository accounts,
                                     TransferDomainService transferService,
                                     ApplicationEventPublisher events) {
        this.accounts = accounts;
        this.transferService = transferService;
        this.events = events;
    }

    @Transactional
    public AccountDto openAccount(OpenAccountCommand cmd) {
        BankAccount a = BankAccount.open(new UserId(cmd.ownerId()),
                AccountNumber.generate(), cmd.type(), cmd.currency());
        return AccountDto.from(accounts.save(a));
    }

    @Transactional
    public void deposit(DepositCommand cmd) {
        BankAccount a = accounts.findById(new AccountId(cmd.accountId()))
                .orElseThrow(() -> new AccountNotFoundException(cmd.accountId()));
        a.deposit(Money.of(cmd.amount(), cmd.currency()));
        accounts.save(a);
        events.publishEvent(new MoneyDepositedEvent(a.id(), cmd.amount()));
    }

    @Transactional
    public void transfer(TransferCommand cmd) {
        BankAccount from = accounts.findById(new AccountId(cmd.fromId())).orElseThrow();
        BankAccount to   = accounts.findByNumber(new AccountNumber(cmd.toNumber())).orElseThrow();
        transferService.transfer(from, to, Money.of(cmd.amount(), cmd.currency()));
        accounts.save(from);
        accounts.save(to);
        events.publishEvent(new MoneyTransferredEvent(from.id(), to.id(), cmd.amount()));
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getHistory(UUID accountId) {
        return accounts.findById(new AccountId(accountId)).orElseThrow()
                .history().stream().map(TransactionDto::from).toList();
    }
}
```

## 10.6. Controller (Thymeleaf style)

```java
@Controller
@RequestMapping("/accounts")
public class AccountController {
    private final BankingApplicationService banking;

    @GetMapping
    public String list(@AuthenticationPrincipal CurrentUser user, Model m) {
        m.addAttribute("accounts", banking.listMyAccounts(user.id()));
        return "accounts/list";
    }

    @PostMapping("/{id}/deposit")
    public String deposit(@PathVariable UUID id, @Valid @ModelAttribute DepositForm form) {
        banking.deposit(new DepositCommand(id, form.amount(), form.currency()));
        return "redirect:/accounts/" + id;
    }
}
```

## 10.7. Exception handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(InsufficientBalanceException.class)
    public String onInsufficient(InsufficientBalanceException e, Model m) {
        m.addAttribute("error", "Số dư không đủ");
        return "error/business";
    }
    @ExceptionHandler(InvalidAmountException.class)
    public String onInvalidAmount(InvalidAmountException e, Model m) {
        m.addAttribute("error", e.getMessage());
        return "error/business";
    }
}
```

---

# 11. Roadmap Implementation

| Bước | Việc làm | Verify |
|---|---|---|
| 1 | Spring Boot Initializr: web, security, data-jpa, postgresql, thymeleaf, validation | `mvn spring-boot:run` chạy |
| 2 | `application.yml` + DB connect | Boot không lỗi |
| 3 | Identity: `User` entity, repo, register endpoint | POST `/auth/register` tạo user |
| 4 | Spring Security: form login, BCrypt, UserDetailsService | Login redirect OK |
| 5 | Banking VO: `Money`, `AccountNumber`, `AccountId` + unit test | JUnit pass |
| 6 | `BankAccount` aggregate + `Transaction` + test invariant | Test "withdraw > balance throws" pass |
| 7 | Repository (interface + JPA impl) | Integration test save/load |
| 8 | `BankingApplicationService.openAccount + deposit` | Tạo & nạp tiền qua HTTP OK |
| 9 | `TransferDomainService` + transfer use case | Test A→B, kiểm tra balance |
| 10 | Thymeleaf views: list, detail, deposit form, transfer, history | Click qua toàn bộ luồng |
| 11 | Exception handler + validation messages | Amount âm → lỗi đẹp |
| 12 | Demo seeder + README | Chạy `mvn spring-boot:run` ra dùng được |

---

# 12. Kết nối DB & chạy project

`src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/banking
    username: postgres
    password: postgres
  jpa:
    hibernate.ddl-auto: validate
    properties.hibernate.format_sql: true
    show-sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
server.port: 8080
```

`docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: banking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
```

Chạy:
```bash
docker compose up -d
./mvnw spring-boot:run
# mở http://localhost:8080
```

---

# 13. Tóm tắt tư duy DDD cốt lõi

1. **Đẩy logic vào model, không để model "rỗng".** `account.deposit(money)` thay vì `service.deposit(account, amount)`.
2. **Aggregate là biên giới của consistency.** 1 use case = 1 transaction = thường chỉ chạm 1 aggregate (trừ transfer — phải 2).
3. **Value Object là vũ khí mạnh nhất** để loại bỏ "primitive obsession" — không dùng `float balance`, dùng `Money`.
4. **Domain không biết Spring/JPA** ở mức tư tưởng. Mini project có thể compromise (đặt JPA annotation trực tiếp trên entity domain — chấp nhận được cho học tập).
5. **Repository interface ở domain, impl ở infra** — đây là Dependency Inversion (D trong SOLID).
6. **Reference giữa aggregate bằng ID, không bằng object** — giữ aggregate nhỏ, transaction nhanh.
7. **Application Service mỏng** — chỉ load, gọi domain, save. Không chứa if/else nghiệp vụ.
8. **Composition (◆) đi với Aggregate; Association (→) đi với cross-aggregate by ID.** Đây là nguyên tắc để vẽ diagram đúng DDD.
