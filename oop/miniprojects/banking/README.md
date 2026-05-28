# Mini-Project 1 — Bank Management System

A full-stack banking application built with **Spring Boot** (backend) and **React** (frontend), implementing the OOP class diagram from the course requirement.

---

## How to Run

**Requirements:** Java 17+, Maven

```bash
cd oop/miniprojects/banking
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080) — register an account and explore the UI.

---

## Project Structure

```
src/main/java/com/example/banking/
├── model/
│   ├── Bank.java              ← Central bank entity (@Component singleton)
│   ├── Customer.java          ← Bank customer / login user (@Entity)
│   ├── Account.java           ← Abstract base for all accounts (@Entity)
│   ├── CurrentAccount.java    ← Extends Account (CURRENT type)
│   ├── SavingAccount.java     ← Extends Account (SAVING type, has interest)
│   ├── Transaction.java       ← Records each financial event (@Entity)
│   └── LoginSession.java      ← Tracks login history (@Entity)
├── repository/                ← Spring Data JPA interfaces
├── service/
│   ├── CustomerService.java   ← Registration + Spring Security UserDetailsService
│   └── AccountService.java    ← DTO conversion helpers
├── controller/
│   ├── AccountController.java ← /accounts REST + OOP list operations
│   ├── CustomerController.java← /customers REST + OOP list operations
│   ├── AuthController.java    ← /auth/* login / register / sessions
│   └── TransferController.java← /transfers fund transfer via Bank
└── config/
    └── SecurityConfig.java    ← Spring Security session-based auth

src/main/resources/static/     ← React SPA (no build step, CDN)
```

---

## OOP Class Diagram

```
┌─────────────────────┐         ┌─────────────────────────┐
│        Bank         │         │   CustomerController     │
│─────────────────────│         │─────────────────────────│
│ - code: int         │         │ - CustomerList: ArrayList│
│ - name: string      │◇────────│ + addCustomer()         │
│ - address: string   │         │ + editCustomer()        │
│─────────────────────│         │ + removeCustomer()      │
│ + withdraw()        │         │ + searchCustomer()      │
│ + deposit()         │         └────────────┬────────────┘
│ + checkBalance()    │                      │ manages (dependency)
└──────────┬──────────┘                      ▼
           │ uses (dependency)     ┌─────────────────────┐
           ▼                      │       Customer       │
┌─────────────────────┐           │─────────────────────│
│   AccountController │           │ - id: int           │
│─────────────────────│           │ - name: string      │
│ - AccountList:      │           │ - email: string     │
│     ArrayList       │           │ - phoneNo: string   │
│─────────────────────│           │ - username: string  │
│ + addAccount()      │           │ - address: string   │
│ + editAccount()     │           │ - cardNo: string    │
│ + removeAccount()   │           │─────────────────────│
│ + searchAccount()   │           │ + getName()         │
└──────────┬──────────┘           │ + setName()         │
           │ manages              └──────────┬──────────┘
           ▼                                 │ composition ◆
┌─────────────────────┐                      │ (1 → 1..*)
│      Account        │◄────────────────────┘
│─────────────────────│
│ - number: string    │
│ - balance: float    │
│ - description:string│
│─────────────────────│
│ + getNumber()       │
│ + setNumber()       │
│ + viewAccount()     │ ← abstract
└──────────┬──────────┘
           │ inheritance (generalization)
     ┌─────┴──────┐
     ▼            ▼
┌──────────┐  ┌─────────────────┐
│ Current  │  │  SavingAccount  │
│ Account  │  │─────────────────│
│──────────│  │ - account_title │
│-acct_ttl │  │ - status: string│
│- status  │  │ - interest:float│
│──────────│  │─────────────────│
│+viewAcct()│  │ + viewAccount() │
└──────────┘  │+calculateInterst│
              └─────────────────┘
```

---

## OOP Relationships Explained

### 1. Inheritance — `SavingAccount` and `CurrentAccount` extend `Account`

```java
public abstract class Account { ... }            // parent

public class CurrentAccount extends Account { }  // child 1
public class SavingAccount  extends Account { }  // child 2
```

**What:** Both account types are specialisations of `Account`. They inherit
`number`, `balance`, `description` and must implement `viewAccount()`.
`SavingAccount` adds `interest` and `calculateInterest()`.

**Why:** Avoids duplicating common fields. `Bank.deposit()` / `Bank.withdraw()`
accept any `Account` reference — classic **polymorphism**.

**UML:** Hollow triangle arrow (▷) pointing from child to parent.
JPA mapping: `@Inheritance(SINGLE_TABLE)` + `@DiscriminatorValue`.

---

### 2. Composition — `Customer` ◆──── `Account`

```java
@Entity
public class Customer {
    @OneToMany(mappedBy = "customer",
               cascade = CascadeType.ALL,
               orphanRemoval = true)          // ← strong ownership
    private List<Account> accounts;
}
```

**What:** An `Account` **cannot exist** without its `Customer`.
Deleting a customer cascades and removes all their accounts.

**Distinguishing from Aggregation:** In aggregation the child survives the
parent; here the account has no meaning outside the owning customer.

**UML:** Filled diamond (◆) on the `Customer` side.

---

### 3. Composition — `Account` ◆──── `Transaction`

```java
@Entity
public class Account {
    @OneToMany(mappedBy = "account",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<Transaction> transactions;
}
```

**What:** `Transaction` records belong exclusively to one `Account`.
Deleting the account removes all its history.

---

### 4. Aggregation — `Bank` ◇──── `Customer`

```java
@Component
public class Bank {
    // Bank logically "contains" all customers but does NOT own their lifecycle.
    public void withdraw(Account account, float amount) { ... }
    public void deposit(Account account, float amount)  { ... }
    public float checkBalance(Account account)          { ... }
}
```

**What:** `Bank` represents the institution that manages all customers,
but customers are persisted independently in the database.
The bank **aggregates** rather than composes customers.

**UML:** Hollow diamond (◇) on the `Bank` side.

---

### 5. Dependency — `AccountController` → `Account`

```java
@RestController
public class AccountController {
    private final List<Account> accountList = new ArrayList<>(); // diagram field

    public void addAccount(Account account)    { ... }
    public void removeAccount(Long id)         { ... }
    public Account searchAccount(String number){ ... }
}
```

**What:** `AccountController` **uses** `Account` objects to fulfil its
responsibility; without `Account`, the controller has no purpose.
Same pattern for `CustomerController` → `Customer`.

**UML:** Dashed arrow (– – →).

---

### 6. Association — `TransferController` → `Bank`

```java
public class TransferController {
    private final Bank bank;   // persistent reference

    public ResponseEntity<?> transfer(...) {
        bank.withdraw(from, amount);  // delegates balance mutation to Bank
        bank.deposit(to, amount);
    }
}
```

**What:** `TransferController` holds a reference to `Bank` and delegates
all balance mutations to it. One-directional navigable association.

---

## MVC Architecture

| Layer | Classes | Role |
|-------|---------|------|
| **Model** | `Bank`, `Customer`, `Account`, `CurrentAccount`, `SavingAccount`, `Transaction` | Domain objects + business rules (`deposit`, `withdraw`, `calculateInterest`) |
| **View** | React SPA (`static/`) | Calls REST API, renders UI — no Java knowledge |
| **Controller** | `AccountController`, `CustomerController`, `AuthController`, `TransferController` | Receives HTTP requests, delegates to Model/Service, returns JSON |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create new customer account |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user info |
| POST | `/auth/logout` | Logout + close session |
| GET | `/auth/sessions` | Login history |
| GET | `/accounts` | List authenticated user's accounts |
| GET | `/accounts/{id}/transactions` | Transaction history for one account |
| GET | `/accounts/lookup?number=` | Lookup account owner (used by Transfer) |
| POST | `/transfers` | Transfer funds (calls `Bank.withdraw` + `Bank.deposit`) |
| GET | `/customers/me` | Customer profile |
| PUT | `/customers/me` | Update profile |

---

## Demo Scenario

1. **Register** → two accounts auto-created: `CurrentAccount` (1,000,000 ₫) + `SavingAccount` (5,000,000 ₫)
2. **Login** → session recorded in `LoginSession`
3. **Dashboard** → shows balances (`Bank.checkBalance`), recent transactions
4. **Transfer** → enter destination account number → lookup resolves owner →
   confirm calls `Bank.withdraw()` + `Bank.deposit()` atomically
5. **Transactions** → full history per account
6. **Sessions** → all login events with device/IP
